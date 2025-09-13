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
          const url = await fetchTMDBPosterByTitle(movie.movieNm);
          return url || "/no-image.png";
        })
      );
      setPosters(posterResults);

      const infoResults = await Promise.all(
        boxOffice.map(async (movie) => {
          const info = await fetchTMDBInfoByTitle(movie.movieNm);
          return info;
        })
      );
      setTmdbInfos(infoResults);
    }
    fetchPostersAndInfos();
  }, [boxOffice]);

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
      // KOFIC 영화 제목으로 TMDB에서 ID 검색
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
          currentMovie.movieNm
        )}&language=ko-KR`
      );
      const searchData = await searchResponse.json();

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
    <>
      <div className="flex w-full">
        <div>
          <div className="flex items-center justify-center relative group">
            <button
              onClick={() => {}}
              className="absolute top-1/2 left-[-10px] -translate-y-1/2 text-white px-2 py-2 rounded-full bg-gray-700 bg-opacity-50 hover:bg-gray-600 z-50 opacity-0 group-hover:opacity-100 transition-opacity "
            >
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <polyline
                  points="20,8 12,16 20,24"
                  stroke="#ffffff"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="relative flex flex-row gap-12 justify-start kofic-carousel pl-5 overflow-hidden h-full">
              {boxOffice.map((movieItem, movieIdx) => {
                const poster = posters[movieIdx] || "/no-image.png";
                const tmdbInfo = tmdbInfos[movieIdx] || {
                  overview: null,
                  genres: [],
                  vote_average: null,
                };
                return (
                  <div
                    key={movieIdx}
                    className="flex flex-col items-center relative justify-center"
                    onMouseEnter={() => {
                      setHoveredIdx(movieIdx);
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
                      {movieIdx + 1}
                    </span>
                    <motion.img
                      src={poster}
                      alt={movieItem.movieNm}
                      initial={{ width: 251, height: 358 }}
                      animate={{
                        width: hoveredIdx === movieIdx ? 400 : 251,
                        height: hoveredIdx === movieIdx ? 470 : 358,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 100,
                        duration: 1,
                        delay: hoveredIdx === movieIdx ? 0.1 : 0,
                      }}
                      className="object-cover rounded-lg shadow-lg mb-4 fill-gray-200"
                      style={{
                        minWidth: "250px",
                        maxWidth: "320px",
                        filter:
                          hoveredIdx === movieIdx ? "grayscale(85%)" : "none",
                      }}
                    />
                    {hoveredIdx === movieIdx && (
                      // AnimatePresence와 motion.div를 사용해서 0.3초 뒤에 정보가 fade-in 되도록 만듭니다
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.3, duration: 0.1 }}
                          className="absolute top-0 left-0 w-full h-[470px] flex items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.4)",
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
                              <p className="text-neutral-200">
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
                                tmdbInfo.overview.length > 210
                                  ? tmdbInfo.overview.slice(0, 210) + "..."
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
                                  className="flex items-center gap-2 text-white"
                                >
                                  {/* 영화상세보기 */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    className="size-6"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                                    />
                                  </svg>
                                </button>
                                <div className="bg-zinc-600 py-4 px-5 rounded-full">
                                  <button className="">
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <polygon
                                        points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9"
                                        fill="#C6C6C6"
                                        stroke="#C6C6C6"
                                        strokeWidth="1"
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
              <div
                className="pointer-events-none absolute top-0 right-0 h-full w-32"
                style={{
                  background:
                    "linear-gradient(to left,rgba(11,11,11) 60%, transparent 100%)",
                  zIndex: 20,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
