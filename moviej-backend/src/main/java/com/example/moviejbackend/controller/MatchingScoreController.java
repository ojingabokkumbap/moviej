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

    @GetMapping("/{movieId}/matching")
    public ResponseEntity<?> getMatchingScore(
            @PathVariable Long movieId,
            @RequestParam String email
    ) {
        double score = recommendationService.calculateMatchingScore(email, movieId);
        return ResponseEntity.ok().body(new ScoreResponse(score));
    }

    private record ScoreResponse(double score) {}
}