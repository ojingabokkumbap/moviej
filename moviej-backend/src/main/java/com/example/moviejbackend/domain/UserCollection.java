package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_collections", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "movie_id"})  // 한 사용자가 같은 영화를 중복으로 찜할 수 없음
})
public class UserCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;  // TMDB 영화 ID
    
    @Column(nullable = false)
    private String title;  // 영화 제목
    
    @Column
    private String posterPath;  // 포스터 이미지 경로

    @Column(nullable = false)
    private LocalDateTime createdAt;  // 찜한 날짜
    
    @Column
    private Double rating; // ⭐ 개인 선호도 점수 (nullable 가능)
}
