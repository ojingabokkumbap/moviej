package com.example.moviejbackend.repository;

import com.example.moviejbackend.domain.UserCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCollectionRepository extends JpaRepository<UserCollection, Long> {
    List<UserCollection> findByUserIdOrderByCreatedAtDesc(Long userId);  // 최신순 정렬
    boolean existsByUserIdAndMovieId(Long userId, Long movieId);  // 찜 여부 확인
    Optional<UserCollection> findByUserIdAndMovieId(Long userId, Long movieId);  // 특정 찜 찾기
    void deleteByUserIdAndMovieId(Long userId, Long movieId);  // 찜 삭제
}
