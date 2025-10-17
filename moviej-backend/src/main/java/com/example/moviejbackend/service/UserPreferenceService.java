package com.example.moviejbackend.service;

import com.example.moviejbackend.domain.*;
import com.example.moviejbackend.dto.request.PreferenceRequestDto;
import com.example.moviejbackend.repository.UserPreferenceRepository;
import com.example.moviejbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    /**
     * ✅ 유저 선호도 저장
     */
    @Transactional
    public void saveUserPreference(Long userId, PreferenceRequestDto dto) {
        if (dto == null) return;

        // 1. 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. id=" + userId));

        // 2. DTO → 엔티티 변환
        List<GenreInfo> genres = dto.getGenres().stream()
                .map(g -> GenreInfo.builder()
                        .genreId(g.getGenreId())  // ✅ 실제 genreId 사용
                        .genreName(g.getName())
                        .build())
                .collect(Collectors.toList());

        List<ActorInfo> actors = dto.getActors().stream()
                .map(a -> ActorInfo.builder()
                        .actorId(a.getActorId())  // ✅ 실제 actorId 사용
                        .actorName(a.getName())
                        .build())
                .collect(Collectors.toList());

        List<com.example.moviejbackend.domain.MovieInfo> movies = dto.getMovies().stream()
                .map(m -> com.example.moviejbackend.domain.MovieInfo.builder()
                        .tmdbId(m.getTmdbId())
                        .title(m.getTitle())
                        .rating(m.getRating())
                        // 온보딩 선호 영화만 저장, TMDB 데이터는 저장하지 않음
                        .build())
                .collect(Collectors.toList());

        // 3. UserPreference 생성 및 저장
        UserPreference preference = new UserPreference();
        preference.setUser(user);
        preference.setGenres(genres);
        preference.setActors(actors);
        preference.setMovies(movies);
        preference.setCreatedAt(LocalDateTime.now());

        userPreferenceRepository.save(preference);
    }

    /**
     * ✅ 최신 유저 선호도 조회
     */
    @Transactional(readOnly = true)
    public UserPreference getUserPreferenceByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. id=" + userId));

        return userPreferenceRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElse(null);
    }

}
