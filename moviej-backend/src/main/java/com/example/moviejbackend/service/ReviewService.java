package com.example.moviejbackend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.ReviewLike;
import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.dto.response.PagedReviewResponseDto;
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

    // 전체 리뷰 조회 (isLiked 포함)
    public List<ReviewResponseDto> getAllReviewsWithLike(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
        return reviews.stream().map(review -> {
            boolean isLiked = false;
            if (user != null) {
                isLiked = reviewLikeRepository.existsByReviewAndUser(review, user);
            }
            return new ReviewResponseDto(
                review.getId(),
                review.getTmdbMovieId(),
                review.getMovieTitle(),
                review.getTitle(),
                review.getNickname(),
                review.getProfileImage(),
                review.getRating(),
                review.getContent(),
                review.getLikes(),
                review.getCreatedAt(),
                isLiked
            );
        }).collect(Collectors.toList());
    }

    // 전체 리뷰 페이지네이션 조회 (isLiked 포함)
    public PagedReviewResponseDto getAllReviewsPagedWithLike(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email).orElse(null);
        Page<Review> reviewPage = reviewRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<ReviewResponseDto> content = reviewPage.getContent().stream()
            .map(review -> {
                boolean isLiked = false;
                if (user != null) {
                    isLiked = reviewLikeRepository.existsByReviewAndUser(review, user);
                }
                return new ReviewResponseDto(
                    review.getId(),
                    review.getTmdbMovieId(),
                    review.getMovieTitle(),
                    review.getTitle(),
                    review.getNickname(),
                    review.getProfileImage(),
                    review.getRating(),
                    review.getContent(),
                    review.getLikes(),
                    review.getCreatedAt(),
                    isLiked
                );
            }).collect(Collectors.toList());

        return new PagedReviewResponseDto(
            content,
            reviewPage.getNumber(),
            reviewPage.getSize(),
            reviewPage.getTotalElements(),
            reviewPage.getTotalPages(),
            reviewPage.isFirst(),
            reviewPage.isLast()
        );
    }

    // 전체 리뷰 좋아요순 조회 (메인페이지용 - 이메일 불필요)
    public List<ReviewResponseDto> getAllReviewsByLikes(int limit) {
        List<Review> reviews = reviewRepository.findAllByOrderByLikesDescCreatedAtDesc();
        return reviews.stream()
            .limit(limit)
            .map(review -> new ReviewResponseDto(
                review.getId(),
                review.getTmdbMovieId(),
                review.getMovieTitle(),
                review.getTitle(),
                review.getNickname(),
                review.getProfileImage(),
                review.getRating(),
                review.getContent(),
                review.getLikes(),
                review.getCreatedAt(),
                false  // 로그인 안 한 상태이므로 isLiked는 항상 false
            ))
            .collect(Collectors.toList());
    }

    // 영화별 전체 리뷰 조회 (isLiked 포함)
    public List<ReviewResponseDto> getMovieReviewsWithLike(String tmdbMovieId, String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        List<Review> reviews = reviewRepository.findByTmdbMovieIdOrderByCreatedAtDesc(tmdbMovieId);
        return reviews.stream().map(review -> {
            boolean isLiked = false;
            if (user != null) {
                isLiked = reviewLikeRepository.existsByReviewAndUser(review, user);
            }
            return new ReviewResponseDto(
                review.getId(),
                review.getTmdbMovieId(),
                review.getMovieTitle(),
                review.getTitle(),
                review.getNickname(),
                review.getProfileImage(),
                review.getRating(),
                review.getContent(),
                review.getLikes(),
                review.getCreatedAt(),
                isLiked
            );
        }).collect(Collectors.toList());
    }

    // 영화별 페이지네이션 리뷰 조회 (isLiked 포함)
    public PagedReviewResponseDto getMovieReviewsPagedWithLike(String tmdbMovieId, String email, Pageable pageable) {
        User user = userRepository.findByEmail(email).orElse(null);
        Page<Review> reviewPage = reviewRepository.findByTmdbMovieIdOrderByCreatedAtDesc(tmdbMovieId, pageable);

        List<ReviewResponseDto> content = reviewPage.getContent().stream()
            .map(review -> {
                boolean isLiked = false;
                if (user != null) {
                    isLiked = reviewLikeRepository.existsByReviewAndUser(review, user);
                }
                return new ReviewResponseDto(
                    review.getId(),
                    review.getTmdbMovieId(),
                    review.getMovieTitle(),
                    review.getTitle(),
                    review.getNickname(),
                    review.getProfileImage(),
                    review.getRating(),
                    review.getContent(),
                    review.getLikes(),
                    review.getCreatedAt(),
                    isLiked
                );
            }).collect(Collectors.toList());

        return new PagedReviewResponseDto(
            content,
            reviewPage.getNumber(),
            reviewPage.getSize(),
            reviewPage.getTotalElements(),
            reviewPage.getTotalPages(),
            reviewPage.isFirst(),
            reviewPage.isLast()
        );
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

    @Transactional
    // 리뷰 좋아요/좋아요 취소 토글 -> 업데이트된 ReviewResponseDto 반환
    public ReviewResponseDto toggleLikeReview(Long reviewId, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));
        
        // 좋아요 토글
        if (reviewLikeRepository.existsByReviewAndUser(review, user)) {
            // 좋아요 취소
            reviewLikeRepository.deleteByReviewAndUser(review, user);
            review.setLikes(Math.max(0, review.getLikes() - 1));
        } else {
            // 좋아요 추가
            ReviewLike reviewLike = new ReviewLike();
            reviewLike.setReview(review);
            reviewLike.setUser(user);
            reviewLikeRepository.save(reviewLike);
            review.setLikes(review.getLikes() + 1);
        }
        reviewRepository.save(review);

        // 최신 isLiked 상태 계산
        boolean isLiked = reviewLikeRepository.existsByReviewAndUser(review, user);
        
        // 업데이트된 DTO 반환
        return new ReviewResponseDto(
            review.getId(),
            review.getTmdbMovieId(),
            review.getMovieTitle(),
            review.getTitle(),
            review.getNickname(),
            review.getProfileImage(),
            review.getRating(),
            review.getContent(),
            review.getLikes(),
            review.getCreatedAt(),
            isLiked
        );
    }

    // 자신이 쓴 리뷰만 조회 (최적화: User ID로 직접 조회)
    public List<ReviewResponseDto> getReviewsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // User ID로 직접 조회 (전체 리뷰를 가져와서 필터링하지 않음)
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        return reviews.stream()
            .map(review -> new ReviewResponseDto(
                review.getId(),
                review.getTmdbMovieId(),
                review.getMovieTitle(),
                review.getTitle(),
                review.getNickname(),
                review.getProfileImage(),
                review.getRating(),
                review.getContent(),
                review.getLikes(),
                review.getCreatedAt(),
                true  // 자신이 쓴 리뷰이므로 항상 true (좋아요는 자신의 리뷰에 할 수 없다면 false)
            ))
            .collect(Collectors.toList());
    }
}