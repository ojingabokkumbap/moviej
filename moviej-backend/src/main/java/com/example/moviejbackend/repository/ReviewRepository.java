package com.example.moviejbackend.repository;

import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // 로그인 유저가 작성한 모든리뷰조회
    List<Review> findByNicknameOrderByCreatedAtDesc(String nickname);
    
    // 특정 유저가 영화에 작성한 리뷰 조회 (중복방지)
    Optional<Review> findByTmdbMovieIdAndNickname(String tmdbMovieId, String nickname);
    
    // 영화에 작성한 모든 리뷰 조회
    List<Review> findByTmdbMovieIdOrderByCreatedAtDesc(String tmdbMovieId); 
    
}
