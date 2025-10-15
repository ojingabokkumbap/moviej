package com.example.moviejbackend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.ReviewLike;
import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.dto.response.ReviewResponseDto;
import com.example.moviejbackend.repository.ReviewLikeRepository;
import com.example.moviejbackend.repository.ReviewRepository;
import com.example.moviejbackend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    // 전체 리뷰 조회
    public List<ReviewResponseDto> getAllReviews() {
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();  // 최신순 전체 리뷰
        return reviews.stream().map(review -> new ReviewResponseDto(
            review.getId(),
            review.getTmdbMovieId(),
            review.getMovieTitle(),
            review.getTitle(),
            review.getNickname(),
            review.getProfileImage(),
            review.getRating(),
            review.getContent(),
            review.getLikes(),
            review.getCreatedAt()
        )).collect(Collectors.toList());
    }

    // 리뷰작성
    public Review createReview(String email, String tmdbMovieId, String movieTitle, String title, Integer rating, String content) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 중복 체크
        if (reviewRepository.existsByTmdbMovieIdAndUser(tmdbMovieId, user)) {
            throw new IllegalArgumentException("이미 해당 영화에 작성한 리뷰가 존재합니다.");
        }

        Review review = new Review();
        review.setTmdbMovieId(tmdbMovieId);
        review.setMovieTitle(movieTitle);
        review.setUser(user);
        review.setLikes(0);
        review.setRating(rating);
        review.setContent(content);
        return reviewRepository.save(review);
    }

     // 새 메서드: 영화 ID로 리뷰 조회
    public List<ReviewResponseDto> getMovieReviews(String tmdbMovieId) {
        // 1. 리포지토리에서 최신순으로 리뷰 리스트 가져오기
        List<Review> reviews = reviewRepository.findByTmdbMovieIdOrderByCreatedAtDesc(tmdbMovieId);
        
        // 2. Review 객체를 ReviewResponse로 변환 (프론트에 필요한 데이터만)
        return reviews.stream().map(review -> new ReviewResponseDto(
            review.getId(),
            review.getTmdbMovieId(),
            review.getMovieTitle(),
            review.getTitle(),
            review.getNickname(),  // User의 nickname
            review.getProfileImage(),  // User의 profileImage
            review.getRating(),
            review.getContent(),
            review.getLikes(),
            review.getCreatedAt()

        )).collect(Collectors.toList());
    }

    @Transactional
    // 리뷰 좋아요/좋아요 취소 토글
    public void toggleLikeReview(Long reviewId, String email) {
        // 1. email로 사용자 찾기
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 2. 리뷰 찾기
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        
        // 3. 이미 좋아요 했는지 체크
        if (reviewLikeRepository.existsByReviewAndUser(review, user)) {
            // 이미 좋아요 했으면 취소
            reviewLikeRepository.deleteByReviewAndUser(review, user);
            review.setLikes(review.getLikes() - 1);
            reviewRepository.save(review);
        } else {
            // 안 했으면 추가
            ReviewLike reviewLike = new ReviewLike();
            reviewLike.setReview(review);
            reviewLike.setUser(user);
            reviewLikeRepository.save(reviewLike);
            review.setLikes(review.getLikes() + 1);
            reviewRepository.save(review);
        }
    }
}