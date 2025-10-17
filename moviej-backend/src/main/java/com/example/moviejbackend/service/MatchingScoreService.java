package com.example.moviejbackend.service;

import com.example.moviejbackend.domain.*;
import com.example.moviejbackend.repository.UserPreferenceRepository;
import com.example.moviejbackend.repository.UserRepository;
import com.example.moviejbackend.repository.MovieInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingScoreService {
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

        List<UserPreference> preferences = userPreferenceRepository.findByUserId(user.getId());
        if (preferences.isEmpty()) {
            return 0.0;
        }

        List<GenreInfo> allGenres = preferences.stream()
                .flatMap(p -> p.getGenres().stream())
                .filter(g -> g.getGenreId() != null && g.getGenreId() > 0)
                .collect(Collectors.toList());

        List<ActorInfo> allActors = preferences.stream()
                .flatMap(p -> p.getActors().stream())
                .filter(a -> a.getActorId() != null && a.getActorId() > 0)
                .collect(Collectors.toList());

        long matchGenreCount = allGenres.stream()
                .filter(g -> tmdbMovieDto.getGenres().stream()
                        .anyMatch(mg -> mg.getGenreId() != null && mg.getGenreId().equals(g.getGenreId())))
                .count();

        double genreScore = allGenres.isEmpty()
                ? 0.0
                : (matchGenreCount * 100.0 / allGenres.size());

        long matchActorCount = allActors.stream()
                .filter(a -> tmdbMovieDto.getActors().stream()
                        .anyMatch(ma -> ma.getActorId() != null && ma.getActorId().equals(a.getActorId())))
                .count();

        double actorScore = allActors.isEmpty()
                ? 0.0
                : (matchActorCount * 100.0 / allActors.size());

        double baseScore = 20.0;
        double matchingWeight = 0.4;
        double publicWeight = 0.8;
        double baseWeight = 0.1;
        double publicScore;
        if (tmdbMovieDto.getRating() == null || tmdbMovieDto.getRating() == 0.0) {
                publicScore = 65.0; // 기본값(예: 5.0 * 10)
        } else {
                publicScore = tmdbMovieDto.getRating() * 10.0;
        }
        double matchingScore = (genreScore * 1.4) + (actorScore * 1.5);
        double finalScore =
            (baseScore * baseWeight) +
            (publicScore * publicWeight) +
            (matchingScore * matchingWeight);

        if (finalScore > 100.0) finalScore = 100.0;

        return Math.round(finalScore);
    }
}