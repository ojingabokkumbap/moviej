package com.example.moviejbackend.repository;

import com.example.moviejbackend.domain.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname); // 추가
    // 사용자 관련 추가 메서드 정의 가능
    // 예: 사용자 이름으로 찾기, 이메일로 찾기 등
    /*     Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email); */
}
