package com.example.moviejbackend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class PreferenceRequestDto {
    private List<GenreInfo> genres;   // id+name
    private List<ActorInfo> actors;   // id+name
    private List<MovieInfo> movies;   // id+title
}