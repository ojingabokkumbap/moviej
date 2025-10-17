package com.example.moviejbackend.service;

import com.example.moviejbackend.dto.request.TMDBMovieDto;
import com.example.moviejbackend.domain.GenreInfo;
import com.example.moviejbackend.domain.ActorInfo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TMDBService {
    
    @Value("${tmdb.api.key}")
    private String apiKey;
    
    @Value("${tmdb.api.base-url}")
    private String baseUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 메모리 캐시
    private final Map<String, List<TMDBMovieDto>> genreCache = new ConcurrentHashMap<>();
    private final Map<String, List<TMDBMovieDto>> actorCache = new ConcurrentHashMap<>();
    private final Map<Long, List<ActorInfo>> movieActorsCache = new ConcurrentHashMap<>();
    
    /**
     * TMDB에서 인기 영화 목록 조회
     */
    public List<TMDBMovieDto> getPopularMovies(int count) {
        try {
            // TMDB API: 인기 영화 조회 (한국어)
            String url = String.format("%s/movie/popular?api_key=%s&language=ko-KR&page=1", baseUrl, apiKey);
            String response = restTemplate.getForObject(url, String.class);
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode results = root.get("results");
            
            List<TMDBMovieDto> movies = new ArrayList<>();
            int limit = Math.min(count, results.size());
            
            for (int i = 0; i < limit; i++) {
                JsonNode movieNode = results.get(i);
                TMDBMovieDto movie = new TMDBMovieDto();
                
                movie.setTmdbId(movieNode.get("id").asLong());
                movie.setTitle(movieNode.get("title").asText());
                movie.setOverview(movieNode.has("overview") ? movieNode.get("overview").asText() : "");
                movie.setPosterPath(movieNode.has("poster_path") ? movieNode.get("poster_path").asText() : "");
                movie.setReleaseDate(movieNode.has("release_date") ? movieNode.get("release_date").asText() : "");
                movie.setRating(movieNode.has("vote_average") ? movieNode.get("vote_average").asDouble() : 0.0);
                
                // 장르 정보 조회
                List<GenreInfo> genres = getMovieGenres(movieNode);
                movie.setGenres(genres);
                
                // 배우 정보 조회
                List<ActorInfo> actors = getMovieActors(movie.getTmdbId());
                movie.setActors(actors);
                
                movies.add(movie);
            }
            
            return movies;
            
        } catch (Exception e) {
            System.err.println("TMDB API 호출 실패: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * 영화의 장르 정보 파싱
     */
    private List<GenreInfo> getMovieGenres(JsonNode movieNode) {
        List<GenreInfo> genres = new ArrayList<>();
        
        if (movieNode.has("genre_ids")) {
            JsonNode genreIds = movieNode.get("genre_ids");
            for (JsonNode genreId : genreIds) {
                GenreInfo genre = new GenreInfo();
                genre.setGenreId(genreId.asLong());
                genre.setGenreName(getGenreName(genreId.asLong())); // 간단히 ID만 사용
                genres.add(genre);
            }
        }
        
        return genres;
    }
    
    /**
     * 영화의 배우 정보 조회 (캐싱 적용)
     */
    private List<ActorInfo> getMovieActors(Long movieId) {
        // 캐시 확인
        if (movieActorsCache.containsKey(movieId)) {
            return movieActorsCache.get(movieId);
        }
        
        // 캐시에 없으면 TMDB API 호출
        try {
            String url = String.format("%s/movie/%d/credits?api_key=%s&language=ko-KR", 
                    baseUrl, movieId, apiKey);
            String response = restTemplate.getForObject(url, String.class);
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode cast = root.get("cast");
            
            List<ActorInfo> actors = new ArrayList<>();
            int limit = Math.min(5, cast.size()); // 상위 5명만
            
            for (int i = 0; i < limit; i++) {
                JsonNode actorNode = cast.get(i);
                ActorInfo actor = new ActorInfo();
                actor.setActorId(actorNode.get("id").asLong());
                actor.setActorName(actorNode.get("name").asText());
                actors.add(actor);
            }
            
            // 캐시에 저장
            movieActorsCache.put(movieId, actors);
            
            return actors;
            
        } catch (Exception e) {
            System.err.println("배우 정보 조회 실패 (movieId: " + movieId + "): " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * 장르 ID를 장르 이름으로 변환 (간단한 매핑)
     */
    private String getGenreName(Long genreId) {
        // TMDB 장르 ID 매핑 (한국어)
        switch (genreId.intValue()) {
            case 28: return "액션";
            case 12: return "모험";
            case 16: return "애니메이션";
            case 35: return "코미디";
            case 80: return "범죄";
            case 99: return "다큐멘터리";
            case 18: return "드라마";
            case 10751: return "가족";
            case 14: return "판타지";
            case 36: return "역사";
            case 27: return "공포";
            case 10402: return "음악";
            case 9648: return "미스터리";
            case 10749: return "로맨스";
            case 878: return "SF";
            case 10770: return "TV 영화";
            case 53: return "스릴러";
            case 10752: return "전쟁";
            case 37: return "서부";
            default: return "기타";
        }
    }

    /**
     * 장르 기반 영화 검색 (캐싱 적용)
     */
    public List<TMDBMovieDto> searchMoviesByGenre(Long genreId, int pageCount) {
        String cacheKey = "genre:" + genreId + ":" + pageCount;
        
        // 캐시 확인
        if (genreCache.containsKey(cacheKey)) {
            System.out.println("캐시에서 장르 영화 반환: genreId=" + genreId);
            return genreCache.get(cacheKey);
        }
        
        // 캐시에 없으면 TMDB API 호출
        List<TMDBMovieDto> movies = new ArrayList<>();
        try {
            for (int page = 1; page <= pageCount; page++) {
                String url = String.format("%s/discover/movie?api_key=%s&language=ko-KR&with_genres=%d&page=%d&sort_by=popularity.desc", 
                        baseUrl, apiKey, genreId, page);
                String response = restTemplate.getForObject(url, String.class);
                
                JsonNode root = objectMapper.readTree(response);
                JsonNode results = root.get("results");
                
                for (JsonNode movieNode : results) {
                    TMDBMovieDto movie = parseMovieNode(movieNode);
                    if (movie != null) {
                        movies.add(movie);
                    }
                }
            }
            
            // 결과를 캐시에 저장
            genreCache.put(cacheKey, movies);
            System.out.println("TMDB API 호출 후 캐시 저장: genreId=" + genreId + ", 영화 수=" + movies.size());
            
        } catch (Exception e) {
            System.err.println("장르 기반 영화 검색 실패 (genreId: " + genreId + "): " + e.getMessage());
        }
        return movies;
    }

    /**
     * 배우 기반 영화 검색 (캐싱 적용)
     */
    public List<TMDBMovieDto> searchMoviesByActor(Long actorId, int pageCount) {
        String cacheKey = "actor:" + actorId + ":" + pageCount;
        
        // 캐시 확인
        if (actorCache.containsKey(cacheKey)) {
            System.out.println("캐시에서 배우 영화 반환: actorId=" + actorId);
            return actorCache.get(cacheKey);
        }
        
        // 캐시에 없으면 TMDB API 호출
        List<TMDBMovieDto> movies = new ArrayList<>();
        try {
            for (int page = 1; page <= pageCount; page++) {
                String url = String.format("%s/discover/movie?api_key=%s&language=ko-KR&with_cast=%d&page=%d&sort_by=popularity.desc", 
                        baseUrl, apiKey, actorId, page);
                String response = restTemplate.getForObject(url, String.class);
                
                JsonNode root = objectMapper.readTree(response);
                JsonNode results = root.get("results");
                
                for (JsonNode movieNode : results) {
                    TMDBMovieDto movie = parseMovieNode(movieNode);
                    if (movie != null) {
                        movies.add(movie);
                    }
                }
            }
            
            // 결과를 캐시에 저장
            actorCache.put(cacheKey, movies);
            System.out.println("TMDB API 호출 후 캐시 저장: actorId=" + actorId + ", 영화 수=" + movies.size());
            
        } catch (Exception e) {
            System.err.println("배우 기반 영화 검색 실패 (actorId: " + actorId + "): " + e.getMessage());
        }
        return movies;
    }

    /**
     * JsonNode를 TMDBMovieDto로 변환
     */
    private TMDBMovieDto parseMovieNode(JsonNode movieNode) {
        try {
            TMDBMovieDto movie = new TMDBMovieDto();
            
            movie.setTmdbId(movieNode.get("id").asLong());
            movie.setTitle(movieNode.get("title").asText());
            movie.setOverview(movieNode.has("overview") ? movieNode.get("overview").asText() : "");
            movie.setPosterPath(movieNode.has("poster_path") ? movieNode.get("poster_path").asText() : "");
            movie.setReleaseDate(movieNode.has("release_date") ? movieNode.get("release_date").asText() : "");
            movie.setRating(movieNode.has("vote_average") ? movieNode.get("vote_average").asDouble() : 0.0);
            
            // 장르 정보 조회
            List<GenreInfo> genres = getMovieGenres(movieNode);
            movie.setGenres(genres);
            
            // 배우 정보 조회
            List<ActorInfo> actors = getMovieActors(movie.getTmdbId());
            movie.setActors(actors);
            
            return movie;
        } catch (Exception e) {
            System.err.println("영화 파싱 실패: " + e.getMessage());
            return null;
        }
    }
}
