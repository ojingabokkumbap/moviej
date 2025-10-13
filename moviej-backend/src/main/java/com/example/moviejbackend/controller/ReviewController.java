package com.example.moviejbackend.controller;

import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // 리뷰 작성
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            Review createdReview = reviewService.createReview(
                review.getNickname(),
                review.getTmdbMovieId(),
                review.getMovieTitle(),
                review.getRating(),
                review.getContent()
            );
            return ResponseEntity.ok(createdReview);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // 특정 영화의 모든 리뷰 조회
    @GetMapping("/movie/{tmdbMovieId}")
    public ResponseEntity<List<Review>> getMovieReviews(@PathVariable String tmdbMovieId) {
        List<Review> reviews = reviewService.getMovieReviews(tmdbMovieId);
        return ResponseEntity.ok(reviews);
    }


    // 유저가 작성한 모든 리뷰 조회
    @GetMapping("/user")
    public ResponseEntity<?> getUserReviews(@RequestParam String email) {
        try {
            List<Review> reviews = reviewService.getUserReviews(email);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

}
