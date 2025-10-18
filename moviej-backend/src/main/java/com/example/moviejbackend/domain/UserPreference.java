package com.example.moviejbackend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

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
    @JsonIgnore  // JSON 직렬화 시 무한 루프 방지
    private User user;

    // 장르 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "preference_id")
    @Fetch(FetchMode.SUBSELECT)  // MultipleBagFetchException 방지
    private List<GenreInfo> genres;

    // 배우 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "preference_id")
    @Fetch(FetchMode.SUBSELECT)  // MultipleBagFetchException 방지
    private List<ActorInfo> actors;

    // 영화 정보
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "preference_id")
    @Fetch(FetchMode.SUBSELECT)  // MultipleBagFetchException 방지
    private List<MovieInfo> movies;

    private LocalDateTime createdAt;
   
}
