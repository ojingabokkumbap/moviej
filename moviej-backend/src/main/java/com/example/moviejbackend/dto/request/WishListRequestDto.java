package com.example.moviejbackend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishListRequestDto {
    private Long movieId;       // TMDB 영화 ID
    private String title;       // 영화 제목
    private String posterPath;  // 포스터 경로
}
