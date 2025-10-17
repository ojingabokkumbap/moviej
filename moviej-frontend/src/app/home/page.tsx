"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMovieCredits, useMoviesTMDB } from "@/hooks/useMoviesTMDB";
import BoxOffice from "./BoxOffice";
import UpcomingMovies from "./UpcomingMovies";
import TasteMovies from "./TasteMovies";
import BestReview from "./BestReview";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/contexts/NotificationContext";
import { checkWishlist, toggleWishlist } from "@/lib/wishlistAPI";

export default function Home() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { movies, logos, genreMap } = useMoviesTMDB();
  const [startIdx, setStartIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0); // 타이머 진행률 추가
  const visibleMovies = movies.slice(startIdx, startIdx + 4);
  
  // 찜하기 상태
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: number]: boolean }>({});
  const [wishlistLoading, setWishlistLoading] = useState<{ [key: number]: boolean }>({});

  // 출연진 정보 가져오기
  const [credits, setCredits] = useState<{ directors: any[]; cast: any[] }>({
    directors: [],
    cast: [],
  });

  /* 자동재생 */
  useEffect(() => {
    if (movies.length === 0) {
      return;
    }

    const duration = 10000; // 10초
    const step = 100; // 100ms마다 업데이트
    const steps = duration / step;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);

      if (currentStep >= steps) {
        // 10초 완료 시 다음 영화로 이동
        setStartIdx((prev) => {
          const nextIdx = prev + 1;
          if (nextIdx >= movies.length - 3) {
            return 0;
          }
          return nextIdx;
        });
        setSelectedIdx(0);
        setProgress(0); // 완료 시 초기화
        currentStep = 0;
      }
    }, step);

    return () => clearInterval(interval);
  }, [movies.length, startIdx]);

  useEffect(() => {
    async function getCredits() {
      const movie = movies[startIdx + (selectedIdx ?? 0)];
      if (movie) {
        const result = await fetchMovieCredits(movie.id);
        setCredits(result);
      }
    }
    getCredits();
  }, [movies, startIdx, selectedIdx]);

  // 찜 상태 확인 (이미 확인한 영화는 제외)
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail && visibleMovies.length > 0) {
      // 아직 확인하지 않은 영화만 필터링
      const moviesToCheck = visibleMovies.filter(
        (movie) => !(movie.id in wishlistStatus)
      );

      if (moviesToCheck.length === 0) return; // 모두 확인했으면 스킵

      Promise.all(
        moviesToCheck.map(async (movie) => {
          try {
            const isWishlisted = await checkWishlist(userEmail, movie.id);
            return { id: movie.id, isWishlisted };
          } catch {
            return { id: movie.id, isWishlisted: false };
          }
        })
      ).then((results) => {
        const newWishlistStatus: { [key: number]: boolean } = {};
        results.forEach(({ id, isWishlisted }) => {
          newWishlistStatus[id] = isWishlisted;
        });
        setWishlistStatus((prev) => ({ ...prev, ...newWishlistStatus }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMovies]);

  // Hydration 방지 및 클라이언트 사이드 초기화
  useEffect(() => {
    setIsMounted(true);
    setSelectedIdx(0); // 클라이언트에서 초기화
  }, []);
  // 선택된 영화의 백드롭 이미지 URL
  const backdropUrl =
    movies.length > 0
      ? `https://image.tmdb.org/t/p/original${
          movies[startIdx + (selectedIdx ?? 0)]?.backdrop_path
        }`
      : undefined;

  const handlePrev = () => {
    setStartIdx((prev) => Math.max(prev - 1, 0));
    setSelectedIdx(0);
  };

  const handleNext = () => {
    setStartIdx((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx >= movies.length - 3) {
        return 0;
      }
      return nextIdx;
    });
    setSelectedIdx(0);
  };

  const handleDetailClick = () => {
    const currentMovie = visibleMovies[selectedIdx ?? 0];
    if (currentMovie) {
      router.push(`/movie/${currentMovie.id}`);
    }
  };

  // 컬렉션 추가/제거 핸들러
  const handleWishlistToggle = async () => {
    const userEmail = localStorage.getItem("userEmail");
    
    if (!userEmail) {
      showNotification("로그인이 필요합니다.", "warning");
      return;
    }

    const currentMovie = visibleMovies[selectedIdx ?? 0];
    if (!currentMovie) return;

    setWishlistLoading((prev) => ({ ...prev, [currentMovie.id]: true }));
    try {
      await toggleWishlist(userEmail, {
        movieId: currentMovie.id,
        title: currentMovie.title,
        posterPath: currentMovie.poster_path,
      });

      const isNowInWishlist = !wishlistStatus[currentMovie.id];
      setWishlistStatus((prev) => ({ ...prev, [currentMovie.id]: isNowInWishlist }));
      
      showNotification(
        isNowInWishlist ? "컬렉션에 추가되었습니다." : "컬렉션에서 제거되었습니다.",
        "success"
      );
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
      showNotification("컬렉션 처리에 실패했습니다.", "error");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [currentMovie.id]: false }));
    }
  };

  // 포스터 클릭
  const handlePosterClick = (idx: number) => {
    setSelectedIdx(idx);
  };

  // 월 표시
  const todayStr = isMounted
    ? (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}.${month}.${day}`;
      })()
    : "로딩 중...";

  return (
    <main className="flex flex-col items-center justify-center w-full relative mt-[-10px]">
      {/* 백드롭이미지 */}
      <div className="top-container w-full h-[880px] flex flex-col items-center relative">
        <AnimatePresence mode="wait">
          {backdropUrl && (
            <motion.div
              key={backdropUrl}
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                backgroundImage: `linear-gradient(
                  to bottom,
                  rgba(11,11,11,0) 0%,
                  rgba(11,11,11,0) 5%,
                  rgba(11,11,11,0.0) 40%,
                  rgba(11,11,11,0.5) 60%,
                  rgba(11,11,11,0.8) 85%,
                  rgba(11,11,11,1) 100%
                ), url(${backdropUrl})`,
                backgroundSize: "100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "100% 30%",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>
        {/* 영화정보 */}
        <div className="absolute bottom-10 left-16 z-10">
          <div className="text-white">
            {visibleMovies.length > 0 && isMounted ? (
              <>
                <div className="text-6xl font-bold tracking-wide">
                  {logos[startIdx + (selectedIdx ?? 0)] ? (
                    <img
                      src={logos[startIdx + (selectedIdx ?? 0)]}
                      alt={visibleMovies[selectedIdx ?? 0].title + " 로고"}
                      className="max-w-[500px] max-h-[200px] h-[150px] flex justify-left items-center"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <span>{visibleMovies[selectedIdx ?? 0]?.title}</span>
                  )}
                </div>
                <div className="font-light mt-8 flex items-center">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const score =
                        visibleMovies[selectedIdx ?? 0].vote_average / 2;
                      return (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(score)
                              ? "text-white-400"
                              : "text-gray-400"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                        </svg>
                      );
                    })}
                  </div>
                  <span className="ml-2 text-lg text-white">
                    {visibleMovies[selectedIdx ?? 0].vote_average?.toFixed(1)}
                  </span>
                  <span className="ml-4 text-lg text-white">
                    {visibleMovies[selectedIdx ?? 0].release_date?.slice(0, 4)}
                  </span>
                </div>
                <div className="my-4 text-base text-gray-200 tracking-wide">
                  <b>감독&nbsp;</b>{" "}
                  {credits.directors.map((d) => d.name).join(" ")}
                  <br />
                  <b>출연&nbsp;</b>{" "}
                  {credits.cast
                    .slice(0, 4)
                    .map((c) => c.name)
                    .join(" ")}
                </div>
                <div className="mb-12 tracking-wider">
                  {visibleMovies[selectedIdx ?? 0]?.genre_ids
                    ?.map((id: number) => genreMap[id])
                    .filter(Boolean)
                    .map((genre: any) => (
                      <span
                        key={genre}
                        className="inline-block text-gray-200 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold mr-2"
                      >
                        #{genre}
                      </span>
                    ))}
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading[visibleMovies[selectedIdx ?? 0]?.id]}
                    className="px-6 py-3 bg-violet-600 text-white shadow transition w-32 disabled:opacity-50"
                  >
                    {wishlistStatus[visibleMovies[selectedIdx ?? 0]?.id]
                      ? "컬렉션 제거"
                      : "컬렉션 추가"}
                  </button>
                  <button
                    onClick={handleDetailClick}
                    className="px-6 py-3 border border-gray-100 shadow transition w-32 hover:bg-gray-100 hover:text-gray-900"
                  >
                    상세정보
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
        {/* 이미지캐러셀 */}
        <div className="absolute w-[680px] flex items-center justify-center bottom-10 right-0 mx-auto z-20">
          <div className="flex absolute left-[-150px]">
            <button
              onClick={handlePrev}
              disabled={startIdx === 0}
              className="z-20 px-3 py-3 border absolute bottom-[-109px] left-[-10px] border-gray-600 rounded-full shadow"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <polyline
                  points="20,8 12,16 20,24"
                  stroke="#bcbcbc"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="z-20 absolute bottom-[-110px] right-[-120px] shadow"
            >
              <svg width="100" height="68" viewBox="0 0 50 48">
                {/* 배경 원 */}
                <circle
                  cx="35"
                  cy="27"
                  r="20"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* 진행률 원 */}
                <circle
                  cx="23"
                  cy="35"
                  r="20"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 20 * (1 - progress / 100)
                  }`}
                  style={{
                    transition: "stroke-dashoffset 0.1s linear",
                  }}
                />
                {/* 중앙 아이콘 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#bcbcbc"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
                  x="23"
                  y="15"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              </svg>
            </button>
          </div>
          <div className="flex gap-4 overflow-hidden justify-start w-full">
            {visibleMovies.map((movie, idx) => (
              <img
                key={movie.id}
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className={`w-[150px] h-[250px] object-cover shadow cursor-pointer transition-all duration-300 ${
                  selectedIdx === idx
                    ? ""
                    : "opacity-75 hover:scale-100 hover:opacity-100"
                }`}
                onClick={() => handlePosterClick(idx)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full ml-24 mb-10">
        <p className="text-3xl font-medium text-left mb-5 mt-20">
          박스오피스
          <span className="text-base ml-4 font-normal text-gray-400">
            {todayStr}일 기준
          </span>
        </p>
        <BoxOffice />
      </div>
      <div className="w-full mb-10">
        <TasteMovies />
      </div>
      <div className="w-full ml-24 mb-10">
        <p className="text-3xl font-medium text-left mb-5">개봉 예정 영화</p>
        <UpcomingMovies />
      </div>
      {/*  <div className="w-full ml-24 mb-10">
        <p className="text-3xl font-medium text-left mb-5">신규 개봉 영화</p>
        <NewMovies />
      </div> */}
      <div className="w-full ml-24 mb-10">
        <p className="text-3xl font-medium text-left mt-5">인기 감상평</p>
        <BestReview />
      </div>
    </main>
  );
}
