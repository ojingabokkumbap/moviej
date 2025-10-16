package com.example.moviejbackend.controller;

import com.example.moviejbackend.dto.request.PreferenceRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.moviejbackend.service.UserPreferenceService;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
	private final com.example.moviejbackend.service.RecommendationService recommendationService;


	// 매칭 점수 계산 API (TMDBMovieDto를 받아 비교)
	@PostMapping("/score")
	public ResponseEntity<Double> calculateMatchingScore(@RequestParam String email, @RequestBody com.example.moviejbackend.dto.request.TMDBMovieDto tmdbMovieDto) {
		double score = recommendationService.calculateMatchingScore(email, tmdbMovieDto);
		return ResponseEntity.ok(score);
	}
}