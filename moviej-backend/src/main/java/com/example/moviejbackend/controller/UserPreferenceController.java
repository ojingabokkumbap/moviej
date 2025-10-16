package com.example.moviejbackend.controller;

import com.example.moviejbackend.domain.UserPreference;
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
    private final UserPreferenceService userPreferenceService;


    @GetMapping("/user-preferences/check")
    public ResponseEntity<?> checkPreference(@RequestParam Long userId) {
        UserPreference pref = userPreferenceService.getUserPreferenceByUserId(userId);
        if (pref == null) {
            return ResponseEntity.noContent().build(); 
        } else {
            return ResponseEntity.ok(pref); 
        }
    }

    @PostMapping("/{userId}/preferences")
    public ResponseEntity<String> savePreference(
            @PathVariable("userId") Long userId,
            @RequestBody PreferenceRequestDto dto) {

        recommendationService.saveUserPreference(userId, dto);
        return ResponseEntity.ok("Preferences saved successfully");
    }
}