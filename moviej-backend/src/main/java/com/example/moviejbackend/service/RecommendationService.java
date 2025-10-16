package com.example.moviejbackend.service;

import com.example.moviejbackend.domain.*;
import com.example.moviejbackend.dto.request.PreferenceRequestDto;
import com.example.moviejbackend.repository.UserPreferenceRepository;
import com.example.moviejbackend.repository.UserRepository;
import com.example.moviejbackend.repository.MovieInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    // private final UserPreferenceService userPreferenceService;
    private final UserRepository userRepository;               // ✅ 추가
    private final UserPreferenceRepository userPreferenceRepository;  // 이미 있음
    private final MovieInfoRepository movieInfoRepository;     // ✅ 추가

    // public List<MovieWithScore> getRecommendedMoviesForUser(Long userId, List<MovieInfo> movieList) {
    //     UserPreference preference = userPreferenceService.getUserPreferenceByUserId(userId);
    //     if (preference == null) return List.of();

    //     return movieList.stream()
    //             .map(movie -> {
    //                 double score = calculateScore(movie, preference);
    //                 return new MovieWithScore(movie, score);
    //             })
    //             .collect(Collectors.toList());
    // }

    // private double calculateScore(MovieInfo movie, UserPreference preference) {
    //     double score = 0;

    //     // 간단 예시: 장르 + 배우 일치 비율로 점수 계산
    //     long genreMatch = preference.getGenres().stream()
    //             .filter(g -> g.getGenreId().equals(movie.getGenreId())) // movie에 genreId 필요
    //             .count();

    //     long actorMatch = preference.getActors().stream()
    //             .filter(a -> movie.getActorIds().contains(a.getActorId())) // movie에 배우 리스트 필요
    //             .count();

    //     score = (genreMatch * 0.6) + (actorMatch * 0.4);
    //     return Math.min(score, 100); // 0~100% 점수
    // }

    // @Data
    // @AllArgsConstructor
    // public static class MovieWithScore {
    //     private MovieInfo movie;
    //     private double score;
    // }

    @Transactional(readOnly = true)
    public double calculateMatchingScore(String email, Long movieId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. email=" + email));

        UserPreference preference = userPreferenceRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElse(null);
        if (preference == null) return 0.0;

        MovieInfo movie = movieInfoRepository.findByMovieId(movieId)
                .orElseThrow(() -> new IllegalArgumentException("영화 정보를 찾을 수 없습니다. movieId=" + movieId));

        // 장르 점수
        long matchGenreCount = preference.getGenres().stream()
                .filter(g -> movie.getGenres().stream()
                        .anyMatch(mg -> mg.getGenreId().equals(g.getGenreId())))
                .count();

        double genreScore = preference.getGenres().isEmpty()
                ? 0.0
                : (matchGenreCount * 100.0 / preference.getGenres().size());

        // 배우 점수
        long matchActorCount = preference.getActors().stream()
                .filter(a -> movie.getActors().stream()
                        .anyMatch(ma -> ma.getActorId().equals(a.getActorId())))
                .count();

        double actorScore = preference.getActors().isEmpty()
                ? 0.0
                : (matchActorCount * 100.0 / preference.getActors().size());

        // 가중치 적용 (장르 60%, 배우 40%)
        double finalScore = (genreScore * 0.6) + (actorScore * 0.4);

        return Math.round(finalScore * 10.0) / 10.0;
    }
}

