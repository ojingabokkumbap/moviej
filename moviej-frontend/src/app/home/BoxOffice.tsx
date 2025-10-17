import { useState, useEffect } from "react";
import { useMoviesKOFIC } from "@/hooks/useMoviesKOFIC";
import { useRouter } from "next/navigation";
import {
  fetchTMDBPosterByTitle,
  fetchTMDBInfoByTitle,
} from "@/hooks/useMoviesTMDB";

import { motion, AnimatePresence } from "framer-motion";
import CirclePercentChart from "./CirclePercentChart";
import { api } from "@/lib/api";

export default function BoxOffice() {
  const { boxOffice, movieDetails } = useMoviesKOFIC();
  const [posters, setPosters] = useState<string[]>([]);
  const router = useRouter();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(0); // 캐러셀 시작 인덱스 추가
  const [tmdbInfos, setTmdbInfos] = useState<
    {
      [x: string]: any;
      overview: string | null;
      genres: string[];
    }[]
  >([]);
  const [matchingScores, setMatchingScores] = useState<{
    [key: number]: number;
  }>({});
  const [loadingScores, setLoadingScores] = useState<{
    [key: number]: boolean;
  }>({});
  const PRELOAD_COUNT = 5; // 초기 로딩 시 미리 가져올 영화 개수

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("userEmail"));

    async function fetchPostersAndInfos() {
      if (!boxOffice || boxOffice.length === 0) {
        setPosters([]);
        setTmdbInfos([]);
        return;
      }
      const posterResults = await Promise.all(
        boxOffice.map(async (movie) => {
          // KOFIC 개봉일에서 연도 추출
          const koficOpenDt = movieDetails[movie.movieCd]?.openDt;
          const releaseYear = koficOpenDt ? koficOpenDt.slice(0, 4) : null;

          const url = await fetchTMDBPosterByTitle(movie.movieNm, releaseYear);
          return url || "/no-image.png";
        })
      );
      setPosters(posterResults);

      const infoResults = await Promise.all(
        boxOffice.map(async (movie) => {
          // KOFIC 개봉일에서 연도 추출
          const koficOpenDt = movieDetails[movie.movieCd]?.openDt;
          const releaseYear = koficOpenDt ? koficOpenDt.slice(0, 4) : null;

          const info = await fetchTMDBInfoByTitle(movie.movieNm, releaseYear);
          return info;
        })
      );
      setTmdbInfos(infoResults);

      // 취향 점수 조회 - 앞 5개만 미리 로드
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        const scores: { [key: number]: number } = {};
        await Promise.all(
          infoResults.slice(0, PRELOAD_COUNT).map(async (info, index) => {
            if (info && info.id) {
              try {
                const response = await api.post(
                  "/users/matching-score",
                  {
                    tmdbId: info.id,
                    title: info.title || boxOffice[index].movieNm,
                    overview: info.overview || "",
                    posterPath: info.poster_path || "",
                    releaseDate: info.release_date || "",
                    rating: info.vote_average || 0,
                    genres: (info.genre_ids || []).map((gid: number) => ({
                      id: 0,
                      genreId: gid,
                      genreName: "",
                    })),
                    actors: [],
                  },
                  {
                    params: { email: userEmail },
                  }
                );
                scores[index] = response.data.score || 0;
              } catch (err) {
                console.log(
                  `취향 점수 조회 실패 (${boxOffice[index].movieNm}):`,
                  err
                );
                scores[index] = 0;
              }
            }
          })
        );
        setMatchingScores(scores);
      }
    }
    fetchPostersAndInfos();
  }, [boxOffice, movieDetails]);

  // Hover 시 취향 점수 개별 로딩
  const fetchMatchingScoreOnHover = async (actualIdx: number) => {
    // 이미 점수가 있거나 로딩 중이면 스킵
    if (matchingScores[actualIdx] !== undefined || loadingScores[actualIdx]) {
      return;
    }

    const userEmail = localStorage.getItem("userEmail");
    const info = tmdbInfos[actualIdx];

    if (!userEmail || !info || !info.id) return;

    // 로딩 상태 설정
    setLoadingScores((prev) => ({ ...prev, [actualIdx]: true }));

    try {
      const response = await api.post(
        "/users/matching-score",
        {
          tmdbId: info.id,
          title: info.title || boxOffice[actualIdx].movieNm,
          overview: info.overview || "",
          posterPath: info.poster_path || "",
          releaseDate: info.release_date || "",
          rating: info.vote_average || 0,
          genres: (info.genre_ids || []).map((gid: number) => ({
            id: 0,
            genreId: gid,
            genreName: "",
          })),
          actors: [],
        },
        {
          params: { email: userEmail },
        }
      );

      setMatchingScores((prev) => ({
        ...prev,
        [actualIdx]: response.data.score || 0,
      }));
    } catch (err) {
      console.log(
        `취향 점수 조회 실패 (${boxOffice[actualIdx].movieNm}):`,
        err
      );
      setMatchingScores((prev) => ({
        ...prev,
        [actualIdx]: 0,
      }));
    } finally {
      setLoadingScores((prev) => ({ ...prev, [actualIdx]: false }));
    }
  };

  const handleNextClick = () => {
    setStartIndex((prev) => (prev + 5) % boxOffice.length);
  };

  // 순환형 영화 배열 생성
  const getCircularMovies = () => {
    const totalMovies = boxOffice.length;
    if (totalMovies === 0) return [];

    const movies = [];
    for (let i = 0; i < totalMovies; i++) {
      const index = (startIndex + i) % totalMovies;
      movies.push({
        ...boxOffice[index],
        originalIndex: index,
      });
    }
    return movies;
  };

  const visibleMovies = getCircularMovies();

  if (!boxOffice || boxOffice.length === 0) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        박스오피스 데이터가 없습니다.
      </div>
    );
  }

  const handleDetailClick = async (actualIdx: number) => {
    const currentMovie = boxOffice[actualIdx];
    if (!currentMovie) return;

    try {
      // tmdbInfos에서 이미 조회한 ID 사용
      const tmdbInfo = tmdbInfos[actualIdx];
      if (tmdbInfo && tmdbInfo.id) {
        router.push(`/movie/${tmdbInfo.id}`);
        return;
      }

      // tmdbInfo에 ID가 없는 경우에만 API 재조회
      const koficOpenDt = movieDetails[currentMovie.movieCd]?.openDt;
      const releaseYear = koficOpenDt ? koficOpenDt.slice(0, 4) : null;

      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        currentMovie.movieNm
      )}&language=ko-KR`;

      if (releaseYear) {
        searchUrl += `&primary_release_year=${releaseYear}`;
      }

      let searchResponse = await fetch(searchUrl);
      let searchData = await searchResponse.json();

      if (
        (!searchData.results || searchData.results.length === 0) &&
        releaseYear
      ) {
        searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
          currentMovie.movieNm
        )}&language=ko-KR`;

        searchResponse = await fetch(searchUrl);
        searchData = await searchResponse.json();
      }

      if (searchData.results && searchData.results.length > 0) {
        const tmdbMovie = searchData.results[0];
        router.push(`/movie/${tmdbMovie.id}`);
      } else {
        console.error(
          "TMDB에서 영화를 찾을 수 없습니다:",
          currentMovie.movieNm
        );
        alert("영화 상세 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("영화 상세 페이지 이동 중 오류:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="relative">
      {/* 화면 오른쪽 끝 버튼 */}
      <button
        onClick={handleNextClick}
        className="absolute top-1/2 right-14 -translate-y-1/2 text-white px-3 py-3  z-50 transition-opacity opacity-70"
      >
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <polyline
            points="12,8 20,16 12,24"
            stroke="#ffffff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div className="absolute right-0 z-10 w-32 h-full bg-gradient-to-l from-black to-transparent"></div>
      <div className="flex w-full">
        <div>
          <div className="flex items-center justify-center relative group">
            <div className="relative flex flex-row gap-10 justify-start kofic-carousel pl-5 overflow-hidden h-full">
              {visibleMovies.map((movieItem) => {
                const actualIdx = movieItem.originalIndex; // 원본 인덱스 사용
                const poster = posters[actualIdx] || "/no-image.png";
                const tmdbInfo = tmdbInfos[actualIdx] || {
                  overview: null,
                  genres: [],
                  vote_average: null,
                };
                return (
                  <div
                    key={actualIdx}
                    className="flex flex-col items-center relative justify-center cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredIdx(actualIdx);
                      fetchMatchingScoreOnHover(actualIdx);
                    }}
                    onMouseLeave={() => {
                      setHoveredIdx(null);
                    }}
                    onClick={() => handleDetailClick(actualIdx)}
                  >
                    <span
                      className={`absolute text-8xl bottom-2 left-[-25px] italic font-bold text-gray-200 drop-shadow-lg ${
                        hoveredIdx !== null ? "opacity-0" : "opacity-100"
                      } transition-opacity duration-500`}
                      style={{
                        textShadow: "rgb(80 80 80) 2px 2px 11px",
                      }}
                    >
                      {actualIdx + 1}
                    </span>
                    <motion.img
                      src={poster}
                      alt={movieItem.movieNm}
                      initial={{ width: 251, height: 358 }}
                      animate={{
                        width: hoveredIdx === actualIdx ? 400 : 251,
                        height: hoveredIdx === actualIdx ? 450 : 358,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 100,
                        duration: 1,
                        delay: hoveredIdx === actualIdx ? 0.1 : 0,
                      }}
                      className="object-cover rounded-lg shadow-lg mb-4 fill-gray-200"
                      style={{
                        minWidth: "250px",
                        maxWidth: "320px",
                        filter:
                          hoveredIdx === actualIdx ? "grayscale(85%)" : "none",
                      }}
                    />
                    {hoveredIdx === actualIdx && (
                      // AnimatePresence와 motion.div를 사용해서 0.3초 뒤에 정보가 fade-in 되도록 만듭니다
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.3, duration: 0.1 }}
                          className="absolute top-0 left-0 w-full h-[450px] flex items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.7)",
                            zIndex: 10,
                          }}
                        >
                          {/* hover 영화상세내용 */}
                          <div className="text-white text-sm font-light text-left py-7 px-8 tracking-wide relative flex flex-col">
                            <div className=" h-[300px] items-start">
                              <div className="flex items-center justify-start">
                                <p className="text-3xl font-semibold w-full text-left break-words flex items-end mb-1">
                                  {/* 영화 제목 */}
                                  {
                                    movieDetails[movieItem.movieCd]?.movieNm
                                  }{" "}
                                  {/* 장르 */}
                                  <span className="border border-gray-100 px-[5px] py-[2px] text-xs ml-2 mb-1">
                                    {movieDetails[movieItem.movieCd]
                                      ?.audits?.[0]?.watchGradeNm
                                      ? movieDetails[
                                          movieItem.movieCd
                                        ]?.audits?.[0]?.watchGradeNm
                                          .replace("세이상관람가", "+")
                                          .replace("전체관람가", "ALL")
                                          .replace("청소년관람불가", "19+")
                                      : ""}
                                  </span>
                                </p>
                              </div>
                              <p className="font-light mb-2">
                                {tmdbInfo.genres.length > 0
                                  ? tmdbInfo.genres.join(" ")
                                  : ""}{" "}
                                <span className="text-white">
                                  {movieDetails[movieItem.movieCd]?.nations
                                    ?.map((n: any) => n.nationNm)
                                    .join(", ")}
                                </span>
                              </p>
                              <p className="text-neutral-200">
                                평점
                                <span className="ml-2 text-white">
                                  {tmdbInfo.vote_average
                                    ? `★${Number(tmdbInfo.vote_average).toFixed(
                                        1
                                      )} `
                                    : "평점 정보 없음"}
                                </span>
                              </p>
                              <p className="text-neutral-200">
                                개봉
                                <span className="ml-2 text-white">
                                  {/* 개봉일 */}
                                  {movieDetails[movieItem.movieCd]?.openDt
                                    ? `${movieDetails[
                                        movieItem.movieCd
                                      ].openDt.slice(0, 4)}.${movieDetails[
                                        movieItem.movieCd
                                      ].openDt.slice(4, 6)}.${movieDetails[
                                        movieItem.movieCd
                                      ].openDt.slice(6, 8)}`
                                    : ""}
                                </span>
                              </p>
                              <p className="text-neutral-200 mb-2">
                                관객
                                <span className="ml-2 text-white">
                                  {/* 관객수 */}
                                  {movieItem.audiAcc >= 10000
                                    ? `${(movieItem.audiAcc / 10000).toFixed(
                                        1
                                      )}만 명`
                                    : `${Number(
                                        movieItem.audiAcc
                                      ).toLocaleString()} 명`}
                                </span>
                              </p>
                              <span className="leading-tight tracking-tight break-all">
                                {tmdbInfo.overview &&
                                tmdbInfo.overview.length > 180
                                  ? tmdbInfo.overview.slice(0, 180) + "..."
                                  : tmdbInfo.overview}
                              </span>
                            </div>
                            {/* 취향 일치율 */}
                            {isLoggedIn ? (
                              <div className="flex items-center justify-end mt-2">
                                <div className="flex flex-col items-center">
                                  <div className="ml-1">
                                    <CirclePercentChart
                                      percent={matchingScores[actualIdx] || 0}
                                      color="#8b5cf6"
                                      size={70}
                                    />
                                  </div>
                                  <div className="mt-1 font-semibold ml-2">
                                    취향 일치율
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end mt-2">
                                <div className="flex flex-col items-center">
                                  <div className="ml-1">
                                    <CirclePercentChart
                                      color="#8b5cf6"
                                      size={70}
                                      label="?"
                                    />
                                  </div>
                                  <div className="mt-1 font-semibold ml-2">
                                    취향 일치율
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
