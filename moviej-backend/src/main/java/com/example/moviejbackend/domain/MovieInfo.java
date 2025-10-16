package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "movie_info")
public class MovieInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long movieId;   // 영화 고유 ID
    private String title;   // 영화 제목
    private Double rating;  // 사용자가 준 별점

    // ✅ 영화의 장르 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "movie_info_id")
    private List<GenreInfo> genres;

    // ✅ 영화의 배우 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "movie_info_id")
    private List<ActorInfo> actors;
}