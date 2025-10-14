package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"tmdbMovieId", "user_id"})  // 같은 영화에 같은 사용자가 리뷰 중복 방지
})
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 작성자

    @Column(nullable = true)
    private String title;  // 리뷰 제목 필드 추가 (없으면)

    @Column(nullable = false)
    private Integer rating; // 평점 (1-5)

    @Column(columnDefinition = "TEXT")
    private String content; // 리뷰 내용

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")  // 공감 수 추가
    private Integer likes = 0;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt; // 작성일

    @Column
    private LocalDateTime updatedAt; // 수정일

    @Column(nullable = true)
    private String posterPath; // TMDB 포스터 경로

    public String getNickname() {
        return user != null ? user.getNickname() : null;
    }

    public String getProfileImage() {
        return user != null ? user.getProfileImage() : null;
    }
}
