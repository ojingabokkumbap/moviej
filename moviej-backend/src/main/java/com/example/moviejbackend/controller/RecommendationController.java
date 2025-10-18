package com.example.moviejbackend.controller;

import com.example.moviejbackend.dto.request.TMDBMovieDto;
import com.example.moviejbackend.domain.UserPreference;
import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.repository.UserRepository;
import com.example.moviejbackend.repository.UserPreferenceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.moviejbackend.service.TMDBService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
	private final com.example.moviejbackend.service.MatchingScoreService matchingScoreService;
	private final TMDBService tmdbService;
	private final UserRepository userRepository;
	private final UserPreferenceRepository userPreferenceRepository;

	// 추천 영화 목록 API (사용자 선호 기반 TMDB 검색)
	@GetMapping("/movies")
	public ResponseEntity<List<TMDBMovieDto>> getRecommendedMovies(
					@RequestParam String email,
					@RequestParam(defaultValue = "5") int count) {

			System.out.println("🎬 추천 영화 API 호출: email=" + email + ", count=" + count);

			// 1. 사용자 선호도 조회
			User user = userRepository.findByEmail(email)
							.orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. email=" + email));

			List<UserPreference> preferences = userPreferenceRepository.findByUserId(user.getId());
			System.out.println("📊 UserPreference 개수: " + preferences.size());
			
			if (preferences.isEmpty()) {
					System.out.println("⚠️ UserPreference가 비어있습니다!");
					return ResponseEntity.ok(Collections.emptyList());
			}

			// 2. 선호 장르/배우 ID 추출
			Set<Long> genreIds = preferences.stream()
							.flatMap(p -> p.getGenres().stream())
							.filter(g -> g.getGenreId() != null && g.getGenreId() > 0)
							.map(g -> g.getGenreId())
							.collect(Collectors.toSet());

			Set<Long> actorIds = preferences.stream()
							.flatMap(p -> p.getActors().stream())
							.filter(a -> a.getActorId() != null && a.getActorId() > 0)
							.map(a -> a.getActorId())
							.collect(Collectors.toSet());

			System.out.println("🎭 추출된 장르 ID: " + genreIds);
			System.out.println("👥 추출된 배우 ID: " + actorIds);

			// 3. TMDB에서 장르/배우별 영화 검색 (각각 1~2페이지, 중복 제거)
			Set<TMDBMovieDto> candidateMovies = new HashSet<>();
			
			// 장르별 검색 (최대 3개 장르, 각 1페이지)
			genreIds.stream().limit(3).forEach(genreId -> {
					List<TMDBMovieDto> genreMovies = tmdbService.searchMoviesByGenre(genreId, 1);
					System.out.println("🎬 장르 " + genreId + " 검색 결과: " + genreMovies.size() + "개");
					candidateMovies.addAll(genreMovies);
			});

			// 배우별 검색 (최대 3명 배우, 각 1페이지)
			actorIds.stream().limit(3).forEach(actorId -> {
					List<TMDBMovieDto> actorMovies = tmdbService.searchMoviesByActor(actorId, 1);
					System.out.println("👤 배우 " + actorId + " 검색 결과: " + actorMovies.size() + "개");
					candidateMovies.addAll(actorMovies);
			});

			System.out.println("📦 후보 영화 총 개수: " + candidateMovies.size());

			// 4. 각 영화마다 매칭 점수 계산
			List<TMDBMovieDto> scoredMovies = candidateMovies.stream()
							.map(movie -> {
									double score = matchingScoreService.calculateMatchingScore(email, movie);
									movie.setMatchingScore(score);
									return movie;
							})
							.sorted((m1, m2) -> Double.compare(m2.getMatchingScore(), m1.getMatchingScore()))
							.limit(count)
							.collect(Collectors.toList());

			System.out.println("✅ 최종 추천 영화: " + scoredMovies.size() + "개");

			return ResponseEntity.ok(scoredMovies);
	}
}