package com.example.moviejbackend.controller;

import com.example.moviejbackend.dto.request.WishListRequestDto;
import com.example.moviejbackend.dto.response.WishListResponseDto;
import com.example.moviejbackend.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;

    /**
     * 찜하기 추가
     * POST /wishlist?email=test@example.com
     */
    @PostMapping
    public ResponseEntity<?> addToWishList(
            @RequestParam String email,
            @RequestBody WishListRequestDto request) {
        try {
            WishListResponseDto response = wishListService.addToWishList(
                    email,
                    request.getMovieId(),
                    request.getTitle(),
                    request.getPosterPath()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 찜하기 삭제
     * DELETE /wishlist/{movieId}?email=test@example.com
     */
    @DeleteMapping("/{movieId}")
    public ResponseEntity<?> removeFromWishList(
            @PathVariable Long movieId,
            @RequestParam String email) {
        try {
            wishListService.removeFromWishList(email, movieId);
            return ResponseEntity.ok(Map.of("message", "찜 목록에서 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 찜 목록 조회
     * GET /wishlist?email=test@example.com
     */
    @GetMapping
    public ResponseEntity<List<WishListResponseDto>> getWishList(@RequestParam String email) {
        List<WishListResponseDto> wishList = wishListService.getWishList(email);
        return ResponseEntity.ok(wishList);
    }

    /**
     * 찜 여부 확인
     * GET /wishlist/check/{movieId}?email=test@example.com
     */
    @GetMapping("/check/{movieId}")
    public ResponseEntity<Map<String, Boolean>> checkWishList(
            @PathVariable Long movieId,
            @RequestParam String email) {
        boolean isInWishList = wishListService.isInWishList(email, movieId);
        return ResponseEntity.ok(Map.of("isInWishList", isInWishList));
    }

    /**
     * 찜하기 토글 (있으면 삭제, 없으면 추가)
     * POST /wishlist/toggle?email=test@example.com
     */
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleWishList(
            @RequestParam String email,
            @RequestBody WishListRequestDto request) {
        boolean isAdded = wishListService.toggleWishList(
                email,
                request.getMovieId(),
                request.getTitle(),
                request.getPosterPath()
        );
        return ResponseEntity.ok(Map.of(
                "isInWishList", isAdded,
                "message", isAdded ? "찜 목록에 추가되었습니다." : "찜 목록에서 삭제되었습니다."
        ));
    }
}
