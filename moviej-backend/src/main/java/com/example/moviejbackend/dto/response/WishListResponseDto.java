package com.example.moviejbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class WishListResponseDto {
    private Long id;
    private Long movieId;
    private String title;
    private String posterPath;
    private LocalDateTime createdAt;
    private Double rating;
}
