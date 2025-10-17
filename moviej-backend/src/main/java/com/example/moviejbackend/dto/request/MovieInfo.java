package com.example.moviejbackend.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieInfo {
    private Long tmdbId;
    private String title;
    private String overview;
    private String posterPath;
    private String releaseDate;
    private Double rating;
    private List<GenreDto> genres;
    private List<ActorDto> actors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenreDto {
        private Long id;
        private Long genreId;
        private String genreName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActorDto {
        private Long id;
        private Long actorId;
        private String actorName;
    }
}
