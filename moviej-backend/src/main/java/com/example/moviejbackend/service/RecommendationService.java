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
    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final MovieInfoRepository movieInfoRepository;

    @Transactional
    public Long saveMovieInfo(MovieInfo movieInfo) {
        MovieInfo saved = movieInfoRepository.save(movieInfo);
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public double calculateMatchingScore(String email, com.example.moviejbackend.dto.request.TMDBMovieDto tmdbMovieDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. email=" + email));

        UserPreference preference = userPreferenceRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElse(null);
        if (preference == null) return 0.0;

        // TMDBMovieDto의 장르와 배우 정보로 매칭 점수 계산
        long matchGenreCount = preference.getGenres().stream()
                .filter(g -> tmdbMovieDto.getGenres().stream()
                        .anyMatch(mg -> mg.getGenreId().equals(g.getGenreId())))
                .count();

        double genreScore = preference.getGenres().isEmpty()
                ? 0.0
                : (matchGenreCount * 100.0 / preference.getGenres().size());

        long matchActorCount = preference.getActors().stream()
                .filter(a -> tmdbMovieDto.getActors().stream()
                        .anyMatch(ma -> ma.getActorId().equals(a.getActorId())))
                .count();

        double actorScore = preference.getActors().isEmpty()
                ? 0.0
                : (matchActorCount * 100.0 / preference.getActors().size());

        double finalScore = (genreScore * 0.6) + (actorScore * 0.4);
        return Math.round(finalScore * 10.0) / 10.0;
    }
}


