package com.example.moviejbackend.repository;

import java.util.Optional;

import com.example.moviejbackend.domain.MovieInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieInfoRepository extends JpaRepository<MovieInfo, Long> {

    Optional<MovieInfo> findByMovieId(Long movieId);
   
}
