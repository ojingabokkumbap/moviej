package com.example.moviejbackend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovieInfo {
    private Long id;
    private String title;
    private Double rating;
}
