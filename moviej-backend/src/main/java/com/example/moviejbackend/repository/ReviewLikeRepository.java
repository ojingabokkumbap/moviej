package com.example.moviejbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.moviejbackend.domain.ReviewLike;
import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.User;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    
  // 이미 좋아요 했는지 체크하는 메서드
    boolean existsByReviewAndUser(Review review, User user);
    void deleteByReviewAndUser(Review review, User user);  // 추가: 좋아요 취소용
}