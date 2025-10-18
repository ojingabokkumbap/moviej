package com.example.moviejbackend.dto.request;

import com.example.moviejbackend.domain.GenreInfo;
import com.example.moviejbackend.domain.ActorInfo;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.Objects;

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

    // tmdbId 기준으로 중복 제거
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TMDBMovieDto that = (TMDBMovieDto) o;
        return Objects.equals(tmdbId, that.tmdbId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tmdbId);
    }
}
