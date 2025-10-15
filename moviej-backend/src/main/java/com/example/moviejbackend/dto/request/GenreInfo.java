package com.example.moviejbackend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GenreInfo {
    private Long id;
    private Long genreId;
    private String name;
}
