package com.example.moviejbackend.dto.request;

import com.example.moviejbackend.domain.GenreInfo;
import com.example.moviejbackend.domain.ActorInfo;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class TMDBMovieDto {
    private Long tmdbId;
    private String title;
    private String overview;
    private String posterPath;
    private String releaseDate;
    private Double rating;
    private List<GenreInfo> genres;
    private List<ActorInfo> actors;
    private Double matchingScore;  // 매칭 점수
}
