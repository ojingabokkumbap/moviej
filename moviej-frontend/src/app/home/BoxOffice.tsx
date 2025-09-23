import { useState, useEffect } from "react";
import { useMoviesKOFIC } from "@/hooks/useMoviesKOFIC";
import { useRouter } from "next/navigation";
import {
  fetchTMDBPosterByTitle,
  fetchTMDBInfoByTitle,
} from "@/hooks/useMoviesTMDB";

import { motion, AnimatePresence } from "framer-motion";
import CirclePercentChart from "./CirclePercentChart";

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

  useEffect(() => {
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
    }
    fetchPostersAndInfos();
  }, [boxOffice, movieDetails]);

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

  const handleDetailClick = async () => {
    const currentMovie = boxOffice[hoveredIdx ?? 0];
    if (!currentMovie) return;

    try {
      // KOFIC 개봉일에서 연도 추출
      const koficOpenDt = movieDetails[currentMovie.movieCd]?.openDt;
      const releaseYear = koficOpenDt ? koficOpenDt.slice(0, 4) : null;

      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      // 첫 번째 시도: 연도 포함 검색
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
        currentMovie.movieNm
      )}&language=ko-KR`;

      if (releaseYear) {
        searchUrl += `&primary_release_year=${releaseYear}`;
      }

      let searchResponse = await fetch(searchUrl);
      let searchData = await searchResponse.json();

      // 첫 번째 시도에서 결과가 없고 연도가 있었다면, 연도 없이 재시도
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
                    className="flex flex-col items-center relative justify-center"
                    onMouseEnter={() => {
                      setHoveredIdx(actualIdx);
                    }}
                    onMouseLeave={() => {
                      setHoveredIdx(null);
                    }}
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
                        height: hoveredIdx === actualIdx ? 470 : 358,
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
                          className="absolute top-0 left-0 w-full h-[470px] flex items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.7)",
                            zIndex: 10,
                          }}
                        >
                          {/* hover 영화상세내용 */}
                          <div className="text-white text-sm font-light text-left py-7 px-8 tracking-wide relative flex flex-col">
                            <div className=" h-[330px] items-start">
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
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex flex-col items-center">
                                <div className="mb-1 font-bold">
                                  취향 일치율
                                </div>
                                <div className="ml-1">
                                  <CirclePercentChart
                                    percent={75}
                                    color="#8b5cf6"
                                    size={60}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-6">
                                <button
                                  onClick={handleDetailClick}
                                  className="bg-zinc-600 py-[17px] px-7 rounded-full"
                                >
                                  {/* 영화상세보기 */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="6"
                                    height="26"
                                    viewBox="0 0 6 26"
                                    fill="none"
                                  >
                                    <path
                                      d="M3 9C2.36348 9 1.75303 9.23705 1.30295 9.65901C0.852858 10.081 0.600001 10.6533 0.600001 11.25V24.75C0.600001 25.3467 0.852858 25.919 1.30295 26.341C1.75303 26.7629 2.36348 27 3 27C3.63652 27 4.24697 26.7629 4.69706 26.341C5.14714 25.919 5.4 25.3467 5.4 24.75V11.25C5.4 10.6533 5.14714 10.081 4.69706 9.65901C4.24697 9.23705 3.63652 9 3 9ZM3 0C2.40666 0 1.82664 0.16495 1.33329 0.473991C0.839943 0.783033 0.455426 1.22229 0.228364 1.7362C0.00130069 2.25012 -0.0581104 2.81562 0.0576452 3.36119C0.173401 3.90676 0.459123 4.4079 0.878681 4.80124C1.29824 5.19457 1.83279 5.46244 2.41473 5.57096C2.99667 5.67948 3.59987 5.62378 4.14805 5.41091C4.69623 5.19804 5.16477 4.83755 5.49441 4.37504C5.82405 3.91253 6 3.36876 6 2.8125C6 2.06658 5.68393 1.35121 5.12132 0.823762C4.55871 0.296316 3.79565 0 3 0Z"
                                      fill="#C6C6C6"
                                    />
                                  </svg>
                                </button>
                                <div className="bg-zinc-600 py-[15px] px-4 rounded-full">
                                  <button className="">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="29"
                                      height="27"
                                      viewBox="0 0 29 27"
                                      fill="none"
                                    >
                                      <path
                                        d="M5.54625 27L7.9025 17.0171L0 10.3026L10.44 9.41447L14.5 0L18.56 9.41447L29 10.3026L21.0975 17.0171L23.4537 27L14.5 21.7066L5.54625 27Z"
                                        fill="#C6C6C6"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
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
