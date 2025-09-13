package com.example.moviejbackend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

// JPA 엔티티로 설정
@Entity
@Table(name = "users") // 테이블 이름을 "users"로 설정하여 생성
@Getter // Lombok: 모든 필드에 대해 Getter 자동 생성
@Setter // Lombok: 모든 필드에 대해 Setter 자동 생성
@NoArgsConstructor // Lombok: 기본 생성자 자동 생성
@AllArgsConstructor // Lombok: 모든 필드를 포함하는 생성자 자동 생성
@ToString // Lombok: toString() 메서드 자동 생성
public class User {

    @Id // Primary Key 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 설정
    private Long id; // 회원 고유 ID
    
    @Column(nullable = false, unique = true)
    private String userId; // 사용자 ID (로그인용)

    @Column(nullable = false)
    private String password; // 비밀번호 (암호화 필요)

    @Column(nullable = false, unique = true)
    private String email; // 이메일

    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER; // 회원 권한 (예: USER, ADMIN)

    @Column(nullable = false)
    @CreationTimestamp // 회원 가입일 자동 생성
    @Temporal(TemporalType.TIMESTAMP) // 날짜/시간 타입 설정
    private LocalDateTime createdAt; // 회원 가입일

    @Column
    private String gender; // 성별

    @Column
    private Integer age; // 나이

    @Column
    private Integer height; // 키

    @Column
    private Integer weight; // 몸무게

}
