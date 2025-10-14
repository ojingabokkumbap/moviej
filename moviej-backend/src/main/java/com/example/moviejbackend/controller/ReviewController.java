package com.example.moviejbackend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.dto.request.ReviewRequestDto;
import com.example.moviejbackend.dto.response.ReviewResponseDto;
import com.example.moviejbackend.service.ReviewService;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // 전체 리뷰 조회
    @GetMapping
    public ResponseEntity<List<ReviewResponseDto>> getAllReviews() {
        List<ReviewResponseDto> reviews = reviewService.getAllReviews(); 
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 작성
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequestDto request) {
        Review review = reviewService.createReview(request.getEmail(), request.getTmdbMovieId(), request.getMovieTitle(),
                                                request.getTitle(), request.getRating(), request.getContent());
        return ResponseEntity.ok(review);
    }

    // 영화 리뷰 조회
    @GetMapping("/movie/{tmdbMovieId}")
    public ResponseEntity<List<ReviewResponseDto>> getMovieReviews(@PathVariable String tmdbMovieId) {
        List<ReviewResponseDto> reviews = reviewService.getMovieReviews(tmdbMovieId);
        
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 좋아요/좋아요 취소 토글
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<?> toggleLikeReview(@PathVariable Long reviewId, @RequestParam String email) {
        reviewService.toggleLikeReview(reviewId, email);
        return ResponseEntity.ok().build();  // 성공 시 200 OK
    }
}