package com.example.moviejbackend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class PreferenceRequestDto {
    private List<GenreDto> genres;
    private List<ActorDto> actors;
    private List<MovieInfo> movies;

    @Getter
    @Setter
    public static class GenreDto {
        private Long id;
        private Long genreId;  // 실제 장르 ID
        
        @JsonProperty("name")  // JSON의 "name" 필드를 매핑
        private String name;
        
        @JsonProperty("genreName")  // JSON의 "genreName" 필드도 매핑 (둘 다 지원)
        public void setGenreName(String genreName) {
            this.name = genreName;
        }
    }

    @Getter
    @Setter
    public static class ActorDto {
        private Long id;
        private Long actorId;  // 실제 배우 ID
        
        @JsonProperty("name")  // JSON의 "name" 필드를 매핑
        private String name;
        
        @JsonProperty("actorName")  // JSON의 "actorName" 필드도 매핑 (둘 다 지원)
        public void setActorName(String actorName) {
            this.name = actorName;
        }
    }
}