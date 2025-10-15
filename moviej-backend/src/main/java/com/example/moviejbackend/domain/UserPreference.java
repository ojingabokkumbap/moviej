package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import com.example.moviejbackend.domain.GenreInfo;
import com.example.moviejbackend.domain.ActorInfo;
import com.example.moviejbackend.domain.MovieInfo;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_preferences")
public class UserPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 장르 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "preference_id")
    private List<GenreInfo> genres;

    // 배우 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "preference_id")
    private List<ActorInfo> actors;

    // 영화 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "preference_id")
    private List<MovieInfo> movies;

    private LocalDateTime createdAt;
   
}
