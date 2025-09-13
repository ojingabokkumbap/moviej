// TMDB API 키 환경변수에서 가져오기
const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

/**
 * TMDB에서 영화 장르 목록을 받아오는 함수
 */
export async function fetchGenres() {
  const res = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ko-KR`
  );
  const data = await res.json();
  return data.genres;
}

/**
 * TMDB에서 인기 영화 목록을 받아오는 함수
 */
export async function fetchPopularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=1`
  );
  const data = await res.json();
  return data.results;
}

/**
 * TMDB에서 영화 로고 이미지를 받아오는 함수
 */
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

/**
 * TMDB에서 영화의 감독과 출연 배우 정보를 받아오는 함수
 */
export async function fetchMovieCredits(movieId: number) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=ko-KR`
  );
  const data = await res.json();
  const directorObj = data.crew.find((c: any) => c.job === "Director");
  const director = directorObj ? directorObj.name : "정보 없음";
  const cast = data.cast.slice(0, 5).map((c: any) => c.name);
  return { director, cast };
}

/**
 * 영화 제목으로 TMDB에서 포스터 이미지를 받아오는 함수
 * @param title 영화 제목
 * @param year 선택적 연도 정보 (더 정확한 매칭을 위해)
 */
export async function fetchTMDBPosterByTitle(title: string, year?: string) {
  try {
    let query = encodeURIComponent(title);
    if (year) {
      query += `&year=${year}`;
    }
    
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&language=ko-KR`
    );
    
    if (!res.ok) {
      console.error(`❌ TMDB API 오류: ${res.status} ${res.statusText}`);
      return null;
    }
    
    const data = await res.json();
    
    if (!data.results || data.results.length === 0) {
      console.log(`🔍 TMDB에서 "${title}" 검색 결과 없음`);
      return null;
    }
    
    // 가장 일치하는 영화를 찾기 (제목이 정확히 일치하는 것 우선)
    let bestMatch = data.results[0];
    
    for (const movie of data.results) {
      if (movie.title === title || movie.original_title === title) {
        bestMatch = movie;
        break;
      }
    }
    
    const posterPath = bestMatch?.poster_path;
    const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
    
    if (imageUrl) {
      console.log(`✅ TMDB 이미지 찾음: "${title}" -> ${bestMatch.title} (${bestMatch.release_date?.slice(0, 4)})`);
    } else {
      console.log(`❌ TMDB 포스터 없음: "${title}"`);
    }
    
    return imageUrl;
  } catch (error) {
    console.error(`❌ TMDB 검색 오류 for "${title}":`, error);
    return null;
  }
}
/**
 * KOFIC에서 박스오피스 영화들의 배우 정보를 모아서 인기 배우를 추출하는 함수
 */
export async function fetchPopularActorsFromKOFIC() {
  const apiKey = process.env.NEXT_PUBLIC_KOFIC_API_KEY;
  
  // 어제 날짜 계산
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const targetDt = `${yyyy}${mm}${dd}`;

  try {
    // 1. 박스오피스 데이터 가져오기
    const boxOfficeRes = await fetch(
      `https://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${targetDt}`
    );
    const boxOfficeData = await boxOfficeRes.json();
    const movies = boxOfficeData.boxOfficeResult?.dailyBoxOfficeList || [];

    // 2. 각 영화의 상세 정보에서 배우 정보 추출
    const actorCounts: { [actorName: string]: number } = {};
    
    await Promise.all(
      movies.slice(0, 10).map(async (movie: any) => {
        try {
          const movieDetailRes = await fetch(
            `https://kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movie.movieCd}`
          );
          const movieDetailData = await movieDetailRes.json();
          const movieInfo = movieDetailData.movieInfoResult?.movieInfo;
          
          // 배우 정보 추출
          const actors = movieInfo?.actors || [];
          actors.forEach((actor: any) => {
            if (actor.peopleNm && actor.cast) { // 배우 이름과 역할이 있는 경우만
              actorCounts[actor.peopleNm] = (actorCounts[actor.peopleNm] || 0) + 1;
            }
          });
        } catch (error) {
          console.error(`영화 ${movie.movieCd} 상세 정보 조회 실패:`, error);
        }
      })
    );

    // 3. 출현 빈도순으로 정렬하여 인기 배우 추출
    const sortedActors = Object.entries(actorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([name]) => name);

    return sortedActors;
  } catch (error) {
    console.error("KOFIC 인기 배우 추출 실패:", error);
    return [];
  }
}

/**
 * KOFIC에서 추출한 배우 이름으로 TMDB에서 이미지를 가져오는 함수
 */
export async function getActorImageFromTMDB(actorName: string) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
        actorName
      )}&language=ko-KR`
    );
    const data = await res.json();
    
    const actor = data.results?.find((person: any) => 
      person.known_for_department === "Acting" && person.profile_path
    );
    
    if (actor) {
      return {
        id: actor.id,
        name: actor.name,
        profilePath: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
        knownFor: actor.known_for?.slice(0, 3).map((movie: any) => movie.title || movie.name).join(", ") || ""
      };
    }
    
    return null;
  } catch (error) {
    console.error(`TMDB에서 ${actorName} 이미지 조회 실패:`, error);
    return null;
  }
}

/**
 * KOFIC 박스오피스 기반 인기 배우 목록 (TMDB 이미지 포함)
 */
export async function fetchKOFICPopularActorsWithImages(region?: string) {
  try {
    // 1. KOFIC에서 인기 배우 이름 추출
    const actorNames = await fetchPopularActorsFromKOFIC();
    
    // 2. 각 배우의 TMDB 이미지 정보 가져오기
    const actorsWithImages = await Promise.all(
      actorNames.map(async (name) => {
        const tmdbActor = await getActorImageFromTMDB(name);
        return tmdbActor || {
          id: Date.now() + Math.random(), // 임시 ID
          name,
          profilePath: null,
          knownFor: ""
        };
      })
    );

    // 3. 지역별 필터링 (필요한 경우)
    let filteredActors = actorsWithImages;
    if (region === "domestic") {
      filteredActors = actorsWithImages.filter(actor => 
        /[가-힣]/.test(actor.name)
      );
    } else if (region === "international") {
      filteredActors = actorsWithImages.filter(actor => 
        !/[가-힣]/.test(actor.name)
      );
    }

    return filteredActors.slice(0, 20);
  } catch (error) {
    console.error("KOFIC 기반 인기 배우 조회 실패:", error);
    return [];
  }
}

/**
 * TMDB에서 영화 상세정보를 받아오는 함수
 */
export async function fetchMovieDetails(movieId: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=ko-KR`
    );
    
    if (!res.ok) {
      throw new Error('영화 상세정보를 가져오는데 실패했습니다.');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("영화 상세정보 조회 실패:", error);
    throw error;
  }
}

/**
 * TMDB에서 영화의 상세한 출연진과 제작진 정보를 받아오는 함수 (상세 페이지용)
 */
export async function fetchDetailedMovieCredits(movieId: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=ko-KR`
    );
    
    if (!res.ok) {
      throw new Error('출연진 정보를 가져오는데 실패했습니다.');
    }
    
    const data = await res.json();
    
    // 감독 정보 추출
    const directors = data.crew
      .filter((person: any) => person.job === "Director")
      .map((director: any) => ({
        id: director.id,
        name: director.name,
        profile_path: director.profile_path
      }));
    
    // 주요 출연진 정보 추출
    const cast = data.cast.slice(0, 10).map((actor: any) => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_path: actor.profile_path
    }));
    
    return { directors, cast };
  } catch (error) {
    console.error("출연진 정보 조회 실패:", error);
    throw error;
  }
}

/**
 * TMDB에서 비슷한 영화 추천을 받아오는 함수
 */
export async function fetchSimilarMovies(movieId: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}&language=ko-KR&page=1`
  );
  const data = await res.json();
  return data.results;
}

/**
 * TMDB에서 영화 영상(예고편, 클립 등)을 받아오는 함수
 */
export async function fetchMovieVideos(movieId: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=ko-KR`
  );
  const data = await res.json();
  return data.results;
}

/**
 * TMDB에서 영화 이미지(백드롭, 포스터 등)를 받아오는 함수
 */
export async function fetchMovieImages(movieId: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${apiKey}`
  );
  const data = await res.json();
  return {
    backdrops: data.backdrops || [],
    posters: data.posters || []
  };
}

/**
 * TMDB에서 영화 리뷰를 받아오는 함수
 */
export async function fetchMovieReviews(movieId: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}&language=ko-KR&page=1`
  );
  const data = await res.json();
  return data.results;
}

/**
 * 특정 장르의 영화들을 가져오는 함수
 */
export async function fetchMoviesByGenre(genreId: number, page: number = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=ko-KR&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
  );
  const data = await res.json();
  return data.results;
}

/**
 * 여러 페이지의 인기 영화를 가져오는 함수
 */
export async function fetchPopularMoviesMultiPage(pages: number = 3) {
  const allMovies = [];
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR&page=${page}`
    );
    const data = await res.json();
    allMovies.push(...data.results);
  }
  return allMovies;
}

/**
 * 최신 영화를 가져오는 함수
 */
export async function fetchLatestMovies(page: number = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=ko-KR&page=${page}`
  );
  const data = await res.json();
  return data.results;
}

/**
 * 평점 높은 영화를 가져오는 함수
 */
export async function fetchTopRatedMovies(page: number = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=ko-KR&page=${page}`
  );
  const data = await res.json();
  return data.results;
}

/**
 * 이번 주 트렌딩 영화를 가져오는 함수
 */
export async function fetchTrendingMoviesWeekly(page: number = 1) {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=ko-KR&page=${page}`
  );
  const data = await res.json();
  return data.results;
}

/**
 * 혼합된 영화 데이터를 가져오는 함수 (인기 + 최신 + 평점높은 + 트렌딩)
 */
export async function fetchMixedMovies() {
  try {
    const [popular, latest, topRated, trending] = await Promise.all([
      fetchPopularMoviesMultiPage(2),
      fetchLatestMovies(1),
      fetchTopRatedMovies(1),
      fetchTrendingMoviesWeekly(1)
    ]);

    // 중복 제거를 위한 Set 사용
    const movieIds = new Set();
    const mixedMovies: any[] = [];

    // 각 카테고리에서 영화 추가 (중복 제거)
    [...popular, ...latest, ...topRated, ...trending].forEach(movie => {
      if (!movieIds.has(movie.id)) {
        movieIds.add(movie.id);
        mixedMovies.push(movie);
      }
    });

    return mixedMovies;
  } catch (error) {
    console.error('혼합 영화 데이터 가져오기 실패:', error);
    return [];
  }
}

/**
 * TMDB에서 영화의 연령 등급 정보를 받아오는 함수
 */
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
      return certification; // "12세이상관람가", "15세이상관람가", "청소년관람불가" 등
    }
    
    // 한국 정보가 없으면 미국(US) 등급 정보로 대체
    const usRelease = data.results?.find((r: any) => r.iso_3166_1 === 'US');
    if (usRelease && usRelease.release_dates?.length > 0) {
      const certification = usRelease.release_dates[0].certification;
      return certification; // "PG-13", "R", "NC-17" 등
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch rating for movie ${movieId}:`, error);
    return null;
  }
}

