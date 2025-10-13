package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tmdbMovieId; // TMDB 영화 ID

    @Column(nullable = false)
    private String movieTitle; // 영화 제목

    @Column(nullable = false)
    private String nickname; // 작성자 닉네임

    @Column(nullable = false)
    private Integer rating; // 평점 (1-5)

    @Column(columnDefinition = "TEXT")
    private String content; // 리뷰 내용

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt; // 작성일

    @Column
    private LocalDateTime updatedAt; // 수정일
}
