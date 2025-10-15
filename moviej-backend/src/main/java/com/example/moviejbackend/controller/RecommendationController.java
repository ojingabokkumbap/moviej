package com.example.moviejbackend.controller;

import com.example.moviejbackend.dto.request.PreferenceRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.moviejbackend.service.RecommendationService;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping("/preferences")
    public ResponseEntity<?> saveUserActivity(
            @RequestParam("userId") Long userId,  // 추후 JWT 인증으로 변경 가능
            @RequestBody PreferenceRequestDto dto
    ) {
        recommendationService.saveUserPreference(userId, dto);
        return ResponseEntity.ok().body("선호도 데이터 저장 완료");
    }
}