package com.example.moviejbackend.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import com.example.moviejbackend.dto.response.PagedReviewResponseDto;

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

     // 전체 리뷰 조회 (페이지네이션)
    @GetMapping
    public ResponseEntity<?> getAllReviews(
            @RequestParam(value = "email") String email,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            Pageable pageable) {

        if (page != null || size != null) {
            // 페이지네이션 요청
            PagedReviewResponseDto pagedReviews = reviewService.getAllReviewsPagedWithLike(email, pageable);
            return ResponseEntity.ok(pagedReviews);
        } else {
            // 전체 리스트 요청
            List<ReviewResponseDto> reviews = reviewService.getAllReviewsWithLike(email);
            return ResponseEntity.ok(reviews);
        }
    }

    // 전체 리뷰 좋아요순 조회 (메인페이지용 - 이메일 불필요)
    @GetMapping("/popular")
    public ResponseEntity<List<ReviewResponseDto>> getPopularReviews(
            @RequestParam(value = "limit", required = false, defaultValue = "5") Integer limit) {

        List<ReviewResponseDto> reviews = reviewService.getAllReviewsByLikes(limit);
        return ResponseEntity.ok(reviews);
    }

    // 특정 영화 리뷰 조회 (페이지네이션)
    @GetMapping("/movie/{tmdbMovieId}")
    public ResponseEntity<?> getMovieReviews(
            @PathVariable String tmdbMovieId,
            @RequestParam(value = "email") String email, // email 파라미터 추가
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            Pageable pageable) {  
        
        if (page != null || size != null) {
            // 페이지네이션 요청
            PagedReviewResponseDto pagedReviews = reviewService.getMovieReviewsPagedWithLike(tmdbMovieId, email, pageable);
            return ResponseEntity.ok(pagedReviews);
        } else {
            // 전체 리스트 요청 (기존 방식)
            List<ReviewResponseDto> reviews = reviewService.getMovieReviewsWithLike(tmdbMovieId, email);
            return ResponseEntity.ok(reviews);
        }
    }

    // 리뷰 작성
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequestDto request) {
        Review review = reviewService.createReview(
            request.getEmail(),
            request.getTmdbMovieId(),
            request.getMovieTitle(),
            request.getTitle(),
            request.getRating(),
            request.getContent()
        );
        return ResponseEntity.ok(review);
    }

    // 리뷰 좋아요/좋아요 취소 토글 -> 최신 DTO 반환
    @PostMapping("/{reviewId}/like")
    public ResponseEntity<ReviewResponseDto> toggleLikeReview(@PathVariable Long reviewId, @RequestParam String email) {
        ReviewResponseDto updatedReview = reviewService.toggleLikeReview(reviewId, email);
        return ResponseEntity.ok(updatedReview);  // 최신 isLiked, likes 포함된 DTO 반환
    }
}