package com.example.moviejbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.example.moviejbackend.service.RecommendationService;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class MatchingScoreController {

    private final RecommendationService recommendationService;


    @PostMapping("/matching-score")
    public ResponseEntity<?> getMatchingScore(
            @RequestParam String email,
            @RequestBody com.example.moviejbackend.dto.request.TMDBMovieDto tmdbMovieDto
    ) {
        double score = recommendationService.calculateMatchingScore(email, tmdbMovieDto);
        return ResponseEntity.ok().body(new ScoreResponse(score));
    }

    private record ScoreResponse(double score) {}
}