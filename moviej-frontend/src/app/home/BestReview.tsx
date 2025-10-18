import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { fetchMovieDetails as getMovieDetails } from "@/lib/tmdbAPI";
import { useNotification } from "@/contexts/NotificationContext";
import { checkWishlist, toggleWishlist } from "@/lib/wishlistAPI";

interface Review {
  id: number;
  tmdbMovieId: string;
  movieTitle: string;
  nickname: string;
  rating: number;
  profileImage?: string;
  likes: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  liked?: boolean;
}

export default function BestReview() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posters, setPosters] = useState<{ [key: string]: string }>({});
  const [startIdx, setStartIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { showNotification } = useNotification();
  // 영화 상세 정보 캐싱
  const [movieDetails, setMovieDetails] = useState<{ [key: string]: any }>({});
  
  // 찜하기 상태
  const [wishlistStatus, setWishlistStatus] = useState<{ [key: string]: boolean }>({});
  const [wishlistLoading, setWishlistLoading] = useState<{ [key: string]: boolean }>({});

  const itemsPerPage = 5;

  // 리뷰와 포스터 불러오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/reviews/popular");
        const sorted = [...res.data].sort((a, b) => b.likes - a.likes);
        setReviews(sorted);

        // 리뷰 데이터를 먼저 로드하고 스켈레톤 해제
        setIsLoading(false);

        // 포스터는 백그라운드에서 로드
        const posterMap: { [key: string]: string } = {};
        const detailsMap: { [key: string]: any } = {};
        await Promise.all(
          sorted.map(async (review) => {
            if (review.tmdbMovieId) {
              try {
                const movie = await getMovieDetails(review.tmdbMovieId);
                posterMap[review.tmdbMovieId] = movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "";
                detailsMap[review.tmdbMovieId] = movie; // 장르 등 전체 정보 저장
              } catch {
                posterMap[review.tmdbMovieId] = "";
                detailsMap[review.tmdbMovieId] = null;
              }
            }
          })
        );
        setPosters(posterMap);
        setMovieDetails(detailsMap);
      } catch {
        setReviews([]);
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const imgCount = reviews.length;

  // 캐러셀 인덱스 계산
  const getVisibleIndexes = () => {
    if (imgCount === 0) return [];
    const arr = [];
    for (let i = 0; i < Math.min(itemsPerPage, imgCount); i++) {
      arr.push((startIdx + i) % imgCount);
    }
    return arr;
  };

  const visibleIndexes = getVisibleIndexes();

  const selectedReview = reviews[selectedIdx];

  // 선택된 리뷰
  const selectedMovie =
    selectedReview?.tmdbMovieId && movieDetails[selectedReview.tmdbMovieId]
      ? movieDetails[selectedReview.tmdbMovieId]
      : null;

  const genreName =
    selectedMovie?.genres && selectedMovie.genres.length > 0
      ? `#${selectedMovie.genres[0].name}`
      : "#장르없음";

  // 찜 상태 확인
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail && reviews.length > 0) {
      Promise.all(
        reviews.map(async (review) => {
          try {
            const isWishlisted = await checkWishlist(userEmail, parseInt(review.tmdbMovieId));
            return { id: review.tmdbMovieId, isWishlisted };
          } catch {
            return { id: review.tmdbMovieId, isWishlisted: false };
          }
        })
      ).then((results) => {
        const newWishlistStatus: { [key: string]: boolean } = {};
        results.forEach(({ id, isWishlisted }) => {
          newWishlistStatus[id] = isWishlisted;
        });
        setWishlistStatus(newWishlistStatus);
      });
    }
  }, [reviews]);

  // 컬렉션 추가/제거 핸들러
  const handleWishlistToggle = async () => {
    const userEmail = localStorage.getItem("userEmail");
    
    if (!userEmail) {
      showNotification("로그인이 필요합니다.", "warning");
      return;
    }

    if (!selectedReview) return;

    setWishlistLoading((prev) => ({ ...prev, [selectedReview.tmdbMovieId]: true }));
    try {
      await toggleWishlist(userEmail, {
        movieId: parseInt(selectedReview.tmdbMovieId),
        title: selectedReview.movieTitle,
        posterPath: selectedMovie?.poster_path || "",
      });

      const isNowInWishlist = !wishlistStatus[selectedReview.tmdbMovieId];
      setWishlistStatus((prev) => ({ ...prev, [selectedReview.tmdbMovieId]: isNowInWishlist }));
      
      showNotification(
        isNowInWishlist ? "컬렉션에 추가되었습니다." : "컬렉션에서 제거되었습니다.",
        "success"
      );
    } catch (err) {
      console.error("컬렉션 처리 실패:", err);
      showNotification("컬렉션 처리에 실패했습니다.", "error");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [selectedReview.tmdbMovieId]: false }));
    }
  };

  return (
    <div className="flex w-full h-[430px]">
      {isLoading || reviews.length === 0 ? (
        <>
          <div className="flex-col justify-start w-2/6 py-16 pr-10">
            <div className="h-4/5">
              <div className="h-5 w-20 bg-gray-700 animate-pulse rounded"></div>
              <div className="h-9 w-full bg-gray-700 animate-pulse rounded mt-1"></div>
              <div className="flex my-2 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-gray-700 animate-pulse rounded"
                  ></div>
                ))}
              </div>
              <div className="space-y-2 mt-3">
                <div className="h-4 w-full bg-gray-700 animate-pulse rounded"></div>
                <div className="h-4 w-5/6 bg-gray-700 animate-pulse rounded"></div>
                <div className="h-4 w-4/6 bg-gray-700 animate-pulse rounded"></div>
              </div>
              <div className="flex items-center mt-3">
                <div className="w-5 h-5 bg-gray-700 animate-pulse rounded-full"></div>
                <div className="h-4 w-20 bg-gray-700 animate-pulse rounded ml-2"></div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 bg-gray-700 animate-pulse rounded"></div>
                <div className="h-4 w-10 bg-gray-700 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="flex gap-4 w-full mt-4">
              <div className="h-11 w-1/3 bg-gray-700 animate-pulse rounded"></div>
              <div className="h-11 w-1/3 bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>

          {/* 스켈레톤 로딩 - 오른쪽 캐러셀 */}
          <div className="w-full flex flex-col items-center justify-center relative">
            <div className="flex gap-6 w-full justify-start items-center">
              <div className="absolute -top-7 right-24 z-10">
                <div className="h-9 w-24 bg-gray-700 animate-pulse rounded-full"></div>
              </div>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`bg-gray-700 animate-pulse shadow-lg rounded-lg
                    ${
                      i === 0
                        ? "h-[20vw] w-[14vw] max-h-[420px] max-w-[320px] min-h-[300px] min-w-[200px]"
                        : "h-[17vw] w-[12.4vw] max-h-[420px] max-w-[320px] min-h-[300px] min-w-[200px]"
                    }
                  `}
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
                  리뷰를 불러오는 중입니다.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 기존 콘텐츠 */}
          <div className="flex-col justify-start w-2/6 py-16 pr-10">
            <div className="h-4/5">
              <p className="text-violet-400 font-medium">{genreName}</p>
              <p className="font-semibold text-4xl mt-1">
                {selectedReview?.movieTitle}
              </p>
              <p className="flex my-2 gap-0.5 items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < (selectedReview?.rating ?? 0)
                        ? "text-violet-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"></path>
                  </svg>
                ))}
              </p>
              <p className="text-gray-300 mt-3 h-20 items-start flex w-5/6">
                {selectedReview?.content}
              </p>
              <div className="flex items-center mb-1">
                <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedReview?.profileImage ? (
                    <Image
                      src={selectedReview.profileImage}
                      alt="프로필 이미지"
                      width={20}
                      height={20}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white font-medium rounded-full">
                      {selectedReview?.nickname?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-gray-300 font-medium ml-2">
                  {selectedReview?.nickname}
                </span>
              </div>
              <div className="text-gray-300 font-medium flex items-center gap-2">
                {/* <span className="text-white font-normal mr-1">받은공감</span> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M8 9h8" />
                  <path d="M8 13h3.5" />
                  <path d="M10.48 19.512l-2.48 1.488v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4" />
                  <path d="M18 22l3.35 -3.284a2.143 2.143 0 0 0 .005 -3.071a2.242 2.242 0 0 0 -3.129 -.006l-.224 .22l-.223 -.22a2.242 2.242 0 0 0 -3.128 -.006a2.143 2.143 0 0 0 -.006 3.071l3.355 3.296z" />
                </svg>
                {selectedReview?.likes}
              </div>
            </div>
            <div className="flex gap-4 w-full mt-4 items-center">
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading[selectedReview?.tmdbMovieId]}
                className="bg-violet-600 text-white px-4 py-2.5 w-1/3 disabled:opacity-50 transition-opacity"
              >
                {wishlistStatus[selectedReview?.tmdbMovieId]
                  ? "컬렉션 제거"
                  : "컬렉션 추가"}
              </button>
              <div className="border border-gray-300 px-4 py-2.5 w-1/3 text-center">
                <Link href={`/movie/${selectedReview?.tmdbMovieId}`}>
                  상세정보
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center relative">
            <div className="flex gap-6 w-full justify-start items-center">
              <div className="absolute -top-7 right-24 z-10">
                <Link href="/reviews?page=0&size=3">
                  <button className="border border-gray-400 pl-5 pr-3 py-1.5 rounded-full text-sm flex items-center justify-center hover:bg-gray-800 transition-colors">
                    더보기
                    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                      <polyline
                        points="12,8 20,16 12,24"
                        stroke="#ffffff"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      ></polyline>
                    </svg>
                  </button>
                </Link>
              </div>
              {visibleIndexes.map((idx, i) => {
                const review = reviews[idx];
                return (
                  <Image
                    key={`review-${idx}-${review?.id || i}`}
                    src={
                      review?.tmdbMovieId && posters[review.tmdbMovieId]
                        ? posters[review.tmdbMovieId]
                        : "/no-poster.png"
                    }
                    alt={review?.movieTitle || ""}
                    width={320}
                    height={420}
                    className={`object-cover shadow-lg cursor-pointer transition-all 
                  ${
                    selectedIdx === idx
                      ? "border-violet-600"
                      : "border-transparent"
                  }
                  ${
                    i === 0
                      ? "h-[20vw] w-[14vw] max-h-[420px] max-w-[320px] min-h-[300px] min-w-[200px]"
                      : "h-[17vw] w-[12.4vw] max-h-[420px] max-w-[320px] min-h-[300px] min-w-[200px]"
                  }
      rounded-lg
                `}
                    onClick={() => {
                      setStartIdx(idx);
                      setSelectedIdx(idx);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
