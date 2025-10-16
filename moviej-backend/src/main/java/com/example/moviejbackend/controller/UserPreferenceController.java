package com.example.moviejbackend.controller;

import com.example.moviejbackend.dto.request.PreferenceRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.moviejbackend.service.UserPreferenceService;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceService recommendationService;

    @PostMapping("/{userId}/preferences")
    public ResponseEntity<String> savePreference(
            @PathVariable("userId") Long userId,
            @RequestBody PreferenceRequestDto dto) {

        recommendationService.saveUserPreference(userId, dto);
        return ResponseEntity.ok("온보딩 개인 선호도 저장 완료");
    }
}