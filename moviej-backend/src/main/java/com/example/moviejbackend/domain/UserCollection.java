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
@Table(name = "user_collections")
public class UserCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long movieId;  // 영화 고유 ID
    
    private String title;

    private LocalDateTime createdAt;
    private Double rating; // ⭐ 개인 선호도 점수 (nullable 가능)
}
