package com.example.moviejbackend.service;

import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.domain.UserCollection;
import com.example.moviejbackend.domain.UserPreference;
import com.example.moviejbackend.dto.request.ActorInfo;
import com.example.moviejbackend.dto.request.GenreInfo;
import com.example.moviejbackend.dto.request.MovieInfo;
import com.example.moviejbackend.dto.request.PreferenceRequestDto;
import com.example.moviejbackend.repository.UserCollectionRepository;
import com.example.moviejbackend.repository.UserPreferenceRepository;
import com.example.moviejbackend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    
    @Transactional
    public void saveUserPreference(Long userId, PreferenceRequestDto dto) {
        if (dto == null) return;

        // 유저 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. id=" + userId));

        // DTO → 엔티티 변환
        List<com.example.moviejbackend.domain.GenreInfo> genres = dto.getGenres().stream()
                .map((com.example.moviejbackend.dto.request.GenreInfo g) ->
                        com.example.moviejbackend.domain.GenreInfo.builder()
                                .genreId(g.getId())
                                .genreName(g.getName())
                                .build())
                .toList();

        List<com.example.moviejbackend.domain.ActorInfo> actors = dto.getActors().stream()
                .map((com.example.moviejbackend.dto.request.ActorInfo a) ->
                        com.example.moviejbackend.domain.ActorInfo.builder()
                                .actorId(a.getId())
                                .actorName(a.getName())
                                .build())
                .toList();

        List<com.example.moviejbackend.domain.MovieInfo> movies = dto.getMovies().stream()
                .map((com.example.moviejbackend.dto.request.MovieInfo m) ->
                        com.example.moviejbackend.domain.MovieInfo.builder()
                                .movieId(m.getId())
                                .title(m.getTitle())
                                .rating(m.getRating())
                                .build())
                .toList();

        UserPreference preference = UserPreference.builder()
                .user(user)
                .genres(genres)
                .actors(actors)
                .movies(movies)
                .createdAt(LocalDateTime.now())
                .build();

        userPreferenceRepository.save(preference);
    }
}


