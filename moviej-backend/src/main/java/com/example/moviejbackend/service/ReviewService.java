package com.example.moviejbackend.service;

import com.example.moviejbackend.domain.Review;
import com.example.moviejbackend.domain.User;
import com.example.moviejbackend.repository.ReviewRepository;
import com.example.moviejbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    // 리뷰 작성
  public Review createReview(String nickname, String tmdbMovieId, String movieTitle, Integer rating, String content) {
      Optional<User> userOpt = userRepository.findByNickname(nickname);
      if (userOpt.isEmpty()) {
          throw new IllegalArgumentException("로그인 된 사용자만 리뷰를 작성할 수 있습니다.");
      }

      User user = userOpt.get();

      // 이미 해당 영화에 리뷰를 작성했는지 확인 (닉네임 기준으로 변경)
      Optional<Review> existingReview = reviewRepository.findByTmdbMovieIdAndNickname(tmdbMovieId, user.getNickname());
      if (existingReview.isPresent()) {
          throw new IllegalArgumentException("이미 해당 영화에 리뷰를 작성하셨습니다.");
      }

      Review review = new Review();
      review.setTmdbMovieId(tmdbMovieId);
      review.setMovieTitle(movieTitle);
      review.setNickname(user.getNickname()); // 닉네임만 저장
      review.setRating(rating);
      review.setContent(content);

      return reviewRepository.save(review);
  }

    // 특정 영화의 모든 리뷰 조회
    public List<Review> getMovieReviews(String tmdbMovieId) {
        return reviewRepository.findByTmdbMovieIdOrderByCreatedAtDesc(tmdbMovieId);
    }

    // 유저가 작성한 모든 리뷰 조회
    public List<Review> getUserReviews(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        String nickname = userOpt.get().getNickname();
        return reviewRepository.findByNicknameOrderByCreatedAtDesc(nickname);
    }

}
