package com.example.moviejbackend.controller;

import com.example.moviejbackend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    // private final RecommendationService recommendationService;

    // @GetMapping("/personal")
    // public ResponseEntity<List<MovieResponseDto>> getPersonalRecommendations(
    //         @AuthenticationPrincipal UserPrincipal user
    // ) {
    //     List<MovieResponseDto> recommendations = recommendationService.getPersonalRecommendations(user.getId());
    //     return ResponseEntity.ok(recommendations);
    // }
}