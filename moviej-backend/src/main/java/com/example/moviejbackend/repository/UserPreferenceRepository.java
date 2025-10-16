package com.example.moviejbackend.repository;

import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.domain.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    List<UserPreference> findByUserId(Long userId);

    // ✅ 가장 최근에 저장된 사용자 선호도 한 건만 조회
    Optional<UserPreference> findTopByUserOrderByCreatedAtDesc(User user);
}
