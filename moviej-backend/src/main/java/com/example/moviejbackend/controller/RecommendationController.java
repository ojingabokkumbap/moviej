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

			// 1. 사용자 선호도 조회
			User user = userRepository.findByEmail(email)
							.orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. email=" + email));

			List<UserPreference> preferences = userPreferenceRepository.findByUserId(user.getId());
			if (preferences.isEmpty()) {
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

			// 3. TMDB에서 장르/배우별 영화 검색 (각각 1~2페이지, 중복 제거)
			Set<TMDBMovieDto> candidateMovies = new HashSet<>();
			
			// 장르별 검색 (최대 3개 장르, 각 1페이지)
			genreIds.stream().limit(3).forEach(genreId -> {
					candidateMovies.addAll(tmdbService.searchMoviesByGenre(genreId, 1));
			});

			// 배우별 검색 (최대 3명 배우, 각 1페이지)
			actorIds.stream().limit(3).forEach(actorId -> {
					candidateMovies.addAll(tmdbService.searchMoviesByActor(actorId, 1));
			});

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

			return ResponseEntity.ok(scoredMovies);
	}
}