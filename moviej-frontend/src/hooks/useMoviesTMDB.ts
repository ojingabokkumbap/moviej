import { useState, useEffect } from "react";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function fetchMovieLogo(movieId: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${apiKey}&language=ko-KR&include_image_language=ko,en,null`
  );
  const data = await res.json();
  if (data.logos && data.logos.length > 0) {
    return `https://image.tmdb.org/t/p/w500${data.logos[0].file_path}`;
  }
  return null;
}

// 연령 등급 체크 함수
export async function fetchMovieRating(movieId: number) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${apiKey}`
    );
    const data = await res.json();
    
    // 한국(KR) 등급 정보 찾기
    const koreaRelease = data.results?.find((r: any) => r.iso_3166_1 === 'KR');
    if (koreaRelease && koreaRelease.release_dates?.length > 0) {
      const certification = koreaRelease.release_dates[0].certification;
      return certification;
    }
    
    // 한국 정보가 없으면 미국(US) 등급 정보로 대체
    const usRelease = data.results?.find((r: any) => r.iso_3166_1 === 'US');
    if (usRelease && usRelease.release_dates?.length > 0) {
      const certification = usRelease.release_dates[0].certification;
      return certification;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch rating for movie ${movieId}:`, error);
    return null;
  }
}

// 19세 이상 등급인지 체크하는 함수
export function isAdultRated(certification: string): boolean {
  if (!certification) return false;
  
  // 한국 등급 체크
  if (certification.includes('청소년관람불가') || certification.includes('제한상영가')) {
    return true;
  }
  
  // 미국 등급 체크
  if (certification === 'R' || certification === 'NC-17' || certification === 'X') {
    return true;
  }
  
  return false;
}

export function useMoviesTMDB() {
  const [movies, setMovies] = useState<any[]>([]);
  const [logos, setLogos] = useState<string[]>([]);
  const [genreMap, setGenreMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    async function fetchAll() {
      try {
        // 장르 목록 받아오기
        const genreRes = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ko-KR`
        );
        const genreData = await genreRes.json();
        const map: { [key: number]: string } = {};
        genreData.genres.forEach((g: { id: number; name: string }) => {
          map[g.id] = g.name;
        });
        setGenreMap(map);

        // 여러 카테고리의 영화 데이터 받아오기 (더 많은 페이지)
        const requests = [];
        
        // 인기 영화 (5페이지)
        for (let page = 1; page <= 5; page++) {
          requests.push(
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=${page}`)
          );
        }
        
        // 현재 상영중 (3페이지)
        for (let page = 1; page <= 3; page++) {
          requests.push(
            fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=ko-KR&page=${page}`)
          );
        }
        
        // 평점 높은 영화 (3페이지)
        for (let page = 1; page <= 3; page++) {
          requests.push(
            fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=ko-KR&page=${page}`)
          );
        }
        
        // 개봉 예정 (2페이지)
        for (let page = 1; page <= 2; page++) {
          requests.push(
            fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=ko-KR&page=${page}`)
          );
        }

        const responses = await Promise.all(requests);
        const dataPromises = responses.map(res => res.json());
        const allData = await Promise.all(dataPromises);

        // 모든 영화 데이터 합치기 (중복 제거)
        const allMovies = allData.flatMap((data: any) => data.results || []);

        // 중복 제거
        const uniqueMovies = allMovies.filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        );


        // 처음 50개 영화에 대해서만 로고 받아오기
        const movieLogoPairs = await Promise.all(
          uniqueMovies.slice(0, 50).map(async (movie: any) => ({
            movie,
            logo: await fetchMovieLogo(movie.id)
          }))
        );
        
        // 로고가 있는 영화만 필터링 (movies와 logos 인덱스 완전 매칭)
        const filteredPairs = movieLogoPairs.filter(pair => pair.logo !== null);
        const filteredMovies = filteredPairs.map(pair => pair.movie);
        const filteredLogos = filteredPairs.map(pair => pair.logo as string); // null이 아님을 보장
        
        
        setMovies(filteredMovies);
        setLogos(filteredLogos);
      } catch (error) {
        console.error("Failed to fetch movies or genres:", error);
      }
    }
    fetchAll();
  }, []);

  return { movies, logos, genreMap };
}

/* 출연진 정보 가져오는 API */
export async function fetchMovieCredits(movieId: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=ko-KR`
  );
  const data = await res.json();

  // 감독 정보 추출
  const directors =
    data.crew?.filter((person: any) => person.job === "Director") || [];
  // 배우 정보 추출 (상위 5명)
  const cast = data.cast || [];

  return {
    directors,
    cast,
  };
}

// TMDB 기준 개봉예정작 받아오는 커스텀 훅
export function useUpcomingTMDB() {
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=ko-KR&region=KR`
        );
        const data = await res.json();
        setUpcomingMovies(data.results || []);
      } catch (error) {
        console.error("Failed to fetch TMDB upcoming movies:", error);
        setUpcomingMovies([]);
      }
    }
    fetchUpcoming();
  }, []);

  return { upcomingMovies };
}

// KOFIC 데이터를 TMDB에서 영화 제목으로 검색 결과 받아오는 공통 함수
async function searchTMDBMovieByTitle(title: string, releaseYear?: string) {
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=ko-KR`;
  
  // 연도가 있으면 primary_release_year 파라미터 추가
  if (releaseYear) {
    url += `&primary_release_year=${releaseYear}`;
  }
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.results && data.results.length > 0) {
    // 연도가 주어진 경우, 해당 연도와 가장 가까운 영화를 찾기
    if (releaseYear) {
      return data.results[0]; // primary_release_year로 필터링된 첫 번째 결과
    } else {
      // 연도가 없으면 가장 최신 영화 반환 (release_date 기준 정렬)
      return data.results.sort((a: any, b: any) => 
        new Date(b.release_date || '1900-01-01').getTime() - 
        new Date(a.release_date || '1900-01-01').getTime()
      )[0];
    }
  }
  
  return null;
}

/* KOFIC 영화 제목으로 TMDB 포스터 가져오기 */
export async function fetchTMDBPosterByTitle(title: string, releaseYear?: string) {
  // 첫 번째 시도: 연도가 있으면 연도 포함해서 검색
  let movie = await searchTMDBMovieByTitle(title, releaseYear);
  
  // 첫 번째 시도에서 결과가 없고 연도가 있었다면, 연도 없이 재시도
  if (!movie && releaseYear) {
    movie = await searchTMDBMovieByTitle(title);
  }
  
  const posterPath = movie?.poster_path;
  return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
}

/* KOFIC 영화 제목으로 TMDB 장르와 개요 가져오기 */
export async function fetchTMDBInfoByTitle(title: string, releaseYear?: string) {
  // 첫 번째 시도: 연도가 있으면 연도 포함해서 검색
  let movie = await searchTMDBMovieByTitle(title, releaseYear);
  
  // 첫 번째 시도에서 결과가 없고 연도가 있었다면, 연도 없이 재시도
  if (!movie && releaseYear) {
    movie = await searchTMDBMovieByTitle(title);
  }
  
  if (!movie) return { overview: null, genres: [], vote_average: null };

  // 장르 ID → 장르명 변환
  const genreRes = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ko-KR`
  );
  const genreData = await genreRes.json();
  const genreMap = genreData.genres.reduce((acc: any, g: any) => {
    acc[g.id] = g.name;
    return acc;
  }, {});

  const genres = movie.genre_ids?.map((id: number) => genreMap[id]) || [];
  const countries = movie.production_countries?.map((c: any) => c.name) || [];
  return {
    overview: movie.overview || null,
    genres,
    vote_average: movie.vote_average || null,
    countries,
  };
}
