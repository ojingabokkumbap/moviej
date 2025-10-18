"use client";
import LoginModal from "@/components/LoginModal";
import SignUpModal from "@/components/SignUpModal";
import React, { useCallback, useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    let isMounted = true; // 컴포넌트 마운트 상태 추적
    
    const checkLoginAndFetchRecommendations = async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (!isMounted) return; // 언마운트된 경우 중단

      if (userEmail) {
        setIsLoggedIn(true);
        setIsLoading(true);
        setError(null);

        try {
          console.log("🎬 추천 영화 API 요청:", userEmail);
          const response = await api.get("/recommendations/movies", {
            params: {
              email: userEmail,
              count: 7,
            },
          });
          
          if (!isMounted) return; // 응답 받은 후 언마운트 체크
          
          console.log("✅ 추천 영화 응답:", response.data);
          console.log("📊 응답 데이터 타입:", typeof response.data, Array.isArray(response.data));
          console.log("📊 응답 데이터 길이:", response.data?.length);
          
          // 빈 배열 체크
          if (Array.isArray(response.data) && response.data.length === 0) {
            console.warn("⚠️ 추천 영화가 비어있습니다. 백엔드에서 UserPreference는 조회했지만 TMDB에서 영화를 찾지 못했을 수 있습니다.");
          }
          
          setRecommendedMovies(response.data);
        } catch (error: any) {
          if (!isMounted) return;
          
          console.error("❌ 추천 영화 조회 실패:", error);
          console.error("에러 상세:", error.response?.data || error.message);
          
          // MultipleBagFetchException 에러 감지
          const errorMessage = error.response?.data?.message || error.message || "";
          if (errorMessage.includes("MultipleBagFetchException") || errorMessage.includes("fetch multiple bags")) {
            setError("서버 설정 문제로 추천 영화를 불러올 수 없습니다. 관리자에게 문의해주세요. (에러: Hibernate MultipleBagFetchException)");
          } else {
            setError(error.response?.data?.message || "추천 영화를 불러오는데 실패했습니다.");
          }
          setRecommendedMovies([]);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    };

    checkLoginAndFetchRecommendations();

    return () => {
      isMounted = false; // cleanup 시 플래그 설정
    };
  }, []); // ⭐ storage 이벤트 리스너 제거 (무한 루프 원인)

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

  const handleDetailClick = useCallback((tmdbId: number) => {
    router.push(`/movie/${tmdbId}`);
  }, [router]);

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
          
          {/* 에러 메시지 */}
          {error && (
            <div className="w-full p-4 mb-4 bg-red-900/50 border border-red-500 rounded-lg text-white">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">추천 영화를 불러올 수 없습니다</p>
                  <p className="text-xs text-gray-300">{error}</p>
                  {error.includes("MultipleBagFetchException") && (
                    <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-xs">
                      <p className="font-semibold text-yellow-400 mb-1">🛠️ 개발자 정보:</p>
                      <p className="text-yellow-200">
                        백엔드의 <code className="bg-black/30 px-1 py-0.5 rounded">UserPreference</code> 엔티티에서<br/>
                        <code className="bg-black/30 px-1 py-0.5 rounded">@Fetch(FetchMode.SUBSELECT)</code> 어노테이션을 추가하거나<br/>
                        <code className="bg-black/30 px-1 py-0.5 rounded">List → Set</code>으로 변경하거나<br/>
                        <code className="bg-black/30 px-1 py-0.5 rounded">FetchType.EAGER → LAZY</code>로 변경해야 합니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 로딩 중 */}
          {isLoading ? (
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
          ) : rotatedMovies.length > 0 ? (
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
            <div className="w-full p-8 text-center bg-gray-800/50 rounded-lg">
              <div className="flex flex-col items-center gap-4">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <div>
                  <p className="text-xl text-gray-400 mb-2">추천할 영화를 찾지 못했습니다</p>
                  <p className="text-sm text-gray-500 mb-1">
                    취향 설정은 완료되었지만, TMDB에서 매칭되는 영화를 찾지 못했을 수 있습니다.
                  </p>
                  <p className="text-xs text-gray-600">
                    (브라우저 콘솔(F12)에서 자세한 로그를 확인하세요)
                  </p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => router.push("/onboarding")}
                    className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition text-sm"
                  >
                    취향 다시 설정하기
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm"
                  >
                    새로고침
                  </button>
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
