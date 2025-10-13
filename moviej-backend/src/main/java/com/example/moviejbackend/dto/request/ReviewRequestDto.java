package com.example.moviejbackend.dto.request;

public class ReviewRequestDto {
    private String email;
    private String tmdbMovieId;
    private String movieTitle;
    private String title;
    private Integer rating;
    private String content;

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTmdbMovieId() { return tmdbMovieId; }
    public void setTmdbMovieId(String tmdbMovieId) { this.tmdbMovieId = tmdbMovieId; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}