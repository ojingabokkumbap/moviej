package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_preference_movie")
public class MovieInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tmdbId;      // TMDB 영화 ID
    private String title;     // 영화 제목
    private String overview;  // 영화 설명
    private String posterPath;// 포스터 이미지 경로
    private String releaseDate;// 개봉일
    private Double rating;    // TMDB 평점
}