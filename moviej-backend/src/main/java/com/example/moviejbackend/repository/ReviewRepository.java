package com.example.moviejbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.User;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
     List<Review> findByTmdbMovieIdOrderByCreatedAtDesc(String tmdbMovieId);  // 최신순

    boolean existsByTmdbMovieIdAndUser(String tmdbMovieId, User user);
}