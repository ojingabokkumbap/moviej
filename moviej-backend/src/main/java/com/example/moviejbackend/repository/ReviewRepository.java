package com.example.moviejbackend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.User;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTmdbMovieIdOrderByCreatedAtDesc(String tmdbMovieId);  // 최신순

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);  // 전체 리뷰 페이지네이션
    Page<Review> findByTmdbMovieIdOrderByCreatedAtDesc(String tmdbMovieId, Pageable pageable);  // 특정 영화 리뷰 페이지네이션

    boolean existsByTmdbMovieIdAndUser(String tmdbMovieId, User user);

    List<Review> findAllByOrderByCreatedAtDesc();
    
    // 좋아요순 정렬
    List<Review> findAllByOrderByLikesDescCreatedAtDesc();  // 좋아요 많은순 → 같으면 최신순
    List<Review> findAllByOrderByLikesDescCreatedAtAsc();   // 좋아요 많은순 → 같으면 오래된순
    
    // 특정 사용자가 작성한 리뷰 조회 (User ID 기반)
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}