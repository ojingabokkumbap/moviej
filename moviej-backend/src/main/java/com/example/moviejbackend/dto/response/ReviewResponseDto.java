package com.example.moviejbackend.dto.response;

import java.time.LocalDateTime;

public class ReviewResponseDto {
    private Long id;
    private String tmdbMovieId;
    private String movieTitle;
    private String title;
    private String nickname;
    private String profileImage;
    private Integer rating;
    private String content;
    private Integer likes;
    private LocalDateTime createdAt;
    private boolean isLiked; // 사용자가 이 리뷰에 공감했는지 여부

    public ReviewResponseDto(Long id, String tmdbMovieId, String movieTitle, String title,
                            String nickname, String profileImage, Integer rating, String content,
                            Integer likes, LocalDateTime createdAt, boolean isLiked) {
        this.id = id;
        this.tmdbMovieId = tmdbMovieId;
        this.movieTitle = movieTitle;
        this.title = title;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.rating = rating;
        this.content = content;
        this.likes = likes;
        this.createdAt = createdAt;
        this.isLiked = isLiked;
    }

    // Getters (필요 시 Setters 추가)
    public Long getId() { return id; }
    public String getTmdbMovieId() { return tmdbMovieId; }
    public String getMovieTitle() { return movieTitle; }
    public String getTitle() { return title; }
    public String getNickname() { return nickname; }
    public String getProfileImage() { return profileImage; }
    public Integer getRating() { return rating; }
    public String getContent() { return content; }
    public Integer getLikes() { return likes; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public boolean isLiked() { return isLiked; }
    public void setLiked(boolean liked) { isLiked = liked; }
}