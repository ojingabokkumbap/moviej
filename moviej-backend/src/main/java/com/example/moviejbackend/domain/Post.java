package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// JPA 엔티티로 설정
@Entity
@Table(name = "posts") // 테이블 이름을 "posts"로 설정하여 생성
@Getter // Lombok: 모든 필드에 대해 Getter 자동 생성
@Setter // Lombok: 모든 필드에 대해 Setter 자동 생성
@NoArgsConstructor // Lombok: 기본 생성자 자동 생성
@AllArgsConstructor // Lombok: 모든 필드를 포함하는 생성자 자동 생성
@ToString // Lombok: toString() 메서드 자동 생성
public class Post {

    @Id // Primary Key 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 설정
    private Long id; // 게시글 ID

    @Column(nullable = false) // 제목은 null이 될 수 없음
    private String title; // 게시글 제목

    @Column(nullable = false, columnDefinition = "TEXT") // 내용은 null이 될 수 없으며, TEXT 타입으로 설정
    private String content; // 게시글 내용

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 게시글 작성자 (회원 엔티티 참조)

    @Column(nullable = false) // 작성 시간은 null이 될 수 없음
    private LocalDateTime createdAt; // 게시글 작성 시간

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Column
    private String imageUrl; // 이미지 파일명 또는 URL
}
