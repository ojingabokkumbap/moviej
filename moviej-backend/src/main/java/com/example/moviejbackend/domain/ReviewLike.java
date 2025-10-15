package com.example.moviejbackend.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "review_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"review_id", "user_id"})  // 한 사용자가 한 리뷰에 한 번만 좋아요
})
public class ReviewLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Getters and Setters (Lombok 사용 시 @Getter @Setter 추가)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Review getReview() { return review; }
    public void setReview(Review review) { this.review = review; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}