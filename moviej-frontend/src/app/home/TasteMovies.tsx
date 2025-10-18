"use client";
import LoginModal from "@/components/LoginModal";
import SignUpModal from "@/components/SignUpModal";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface RecommendedMovie {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  rating: number;
  genres: Array<{
    id: number | null;
    genreId: number;
    genreName: string;
  }>;
  actors: Array<{
    id: number | null;
    actorId: number;
    actorName: string;
  }>;
  matchingScore: number;
}

export default function TasteMovies() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<
    RecommendedMovie[]
  >([]);
  const [startIdx, setStartIdx] = useState(0);
  const itemsPerPage = 3;

  const openSignUpModal = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const openLoginModal = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // 로그인 상태 체크 및 추천 영화 조회
  useEffect(() => {
    const checkLoginAndFetchRecommendations = async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (userEmail) {
        setIsLoggedIn(true);

        try {
          const response = await api.get("/recommendations/movies", {
            params: {
              email: userEmail,
              count: 7,
            },
          });
          setRecommendedMovies(response.data);
        } catch (error) {
          console.error("추천 영화 조회 실패:", error);
          setRecommendedMovies([]);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginAndFetchRecommendations();

    // storage 이벤트 리스너 추가 (로그인/로그아웃 감지)
    const handleStorageChange = () => {
      checkLoginAndFetchRecommendations();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const movieCount = recommendedMovies.length;

  // idx 3개씩 움직이게 순환
  const getRotatedMovies = () => {
    if (movieCount === 0) return [];
    return [
      ...recommendedMovies.slice(startIdx),
      ...recommendedMovies.slice(0, startIdx),
    ];
  };

  const handlePrev = () => {
    setStartIdx((prev) => (prev - itemsPerPage + movieCount) % movieCount);
  };

  const handleNext = () => {
    setStartIdx((prev) => (prev + itemsPerPage) % movieCount);
  };

  const rotatedMovies = getRotatedMovies();

  const handleDetailClick = (tmdbId: number) => {
    router.push(`/movie/${tmdbId}`);
  };

  return (
    <div className="px-12">
      {/* 로그인 유도 배너 - 로그인하지 않은 경우만 표시 */}
      {!isLoggedIn && (
        <div className="flex justify-between items-center mb-4 px-16 py-8 rounded-xl bg-gradient-to-r from-indigo-900 to-violet-900">
          <div className="w-full">
            <p className="text-3xl font-semibold text-left mb-1 text-white">
              로그인하고 내 취향영화 알아보자
            </p>
            <p className="text-xl font-light text-left text-white">
              맞춤형 추천으로 새로운 영화를 알아보세요.
            </p>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-white text-blue-950 font-bold px-10 py-4 rounded-xl tracking-wider text-2xl transition"
          >
            로그인
          </button>
        </div>
      )}

      {/* 내 취향 영화 리스트 - 로그인한 경우만 표시 */}
      {isLoggedIn && (
        <div>
          <p className="text-3xl font-semibold text-left mb-5">내 취향 영화</p>
          {rotatedMovies.length > 0 ? (
            <div className="w-full relative">
              <div className="w-full flex items-center mb-4 gap-4 absolute z-20 top-1/2 -translate-y-1/2 opacity-50">
                <button onClick={handlePrev} className="absolute">
                  <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
                    <polyline
                      points="20,8 12,16 20,24"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    ></polyline>
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 py-1 -right-11 absolute"
                >
                  <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
                    <polyline
                      points="12,8 20,16 12,24"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    ></polyline>
                  </svg>
                </button>
              </div>
              <div
                className="gap-5 w-fit h-[170px] grid overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${rotatedMovies.length}, minmax(285px , 1fr))`,
                }}
              >
                {rotatedMovies.map((movie) => {
                  return (
                    <div
                      key={movie.tmdbId}
                      className="w-full max-w-[285px] h-[170px] relative group cursor-pointer"
                      onClick={() => handleDetailClick(movie.tmdbId)}
                    >
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                        alt={movie.title}
                        fill
                        sizes="285px"
                        className="object-cover rounded-lg mb-2 transition-transform duration-300 group-hover:scale-105 bg-cover"
                        style={{
                          borderRadius: "0.5rem",
                          zIndex: 1,
                        }}
                      />

                      {/* 호버시 나타나는 영화 정보 */}
                      <div className="absolute left-[-7px] min-w-[299px] max-w-[299px] h-[45px] bottom-0 bg-black bg-opacity-90 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-center items-center text-white z-20">
                        <div className="flex justify-between w-full px-3">
                          <div>
                            <h3 className="text-base font-bold">
                              {movie.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      {/* 취향 일치율 배지 */}
                      <div className="absolute top-0 left-0 bg-violet-500 text-white px-3 py-1 rounded-tl rounded-br text-xs font-bold z-20 group-hover:opacity-0 transition-opacity duration-300">
                        {movie.matchingScore}%
                      </div>
                    </div>
                  );
                })}
                <div className="absolute -right-20 z-10 w-32 h-full bg-gradient-to-l from-black to-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="w-full relative">
              <div className="flex gap-5 h-[170px]">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="w-full max-w-[285px] h-[170px] relative rounded-lg overflow-hidden bg-gray-800 animate-pulse"
                  ></div>
                ))}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg
                    className="animate-spin h-5 w-5 text-violet-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-base font-light">
                    개인화 맞춤 추천 영화를 탐색 중입니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenSignUp={openSignUpModal}
      />

      {/* 회원가입 모달 */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onOpenLogin={openLoginModal}
      />
    </div>
  );
}
