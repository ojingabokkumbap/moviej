import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { fetchMovieDetails as getMovieDetails } from "@/lib/tmdbAPI";
import { useNotification } from "@/contexts/NotificationContext";

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

  const { showNotification } = useNotification();
  // 영화 상세 정보 캐싱
  const [movieDetails, setMovieDetails] = useState<{ [key: string]: any }>({});

  const itemsPerPage = 5;

  // 리뷰와 포스터 불러오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/reviews/popular");
        const sorted = [...res.data].sort((a, b) => b.likes - a.likes);
        setReviews(sorted);

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
      } catch (err) {
        console.error("리뷰 불러오기 실패:", err);
        setReviews([]);
      }
    };
    fetchReviews();
  }, []);

  const imgCount = reviews.length;

  // 캐러셀 인덱스 계산
  const getVisibleIndexes = () => {
    const arr = [];
    for (let i = 0; i < itemsPerPage; i++) {
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

  const handleLikeToggle = async (reviewId: number) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        showNotification("로그인이 필요합니다.", "warning");
        return;
      }

      // 서버에서 최신 review 상태를 받아옴 (isLiked, likes 등)
      const res = await api.post(
        `/reviews/${reviewId}/like?email=${userEmail}`
      );
      const updatedReview = res.data; // 서버에서 최신 review 반환

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, ...updatedReview } : review
        )
      );
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
      showNotification("좋아요 처리에 실패했습니다.", "error");
    }
  };

  return (
    <div className="flex w-full h-[430px]">
      <div className="flex-col justify-start w-2/6 py-16 pr-10">
        <div className="h-4/5">
          <p className="text-violet-400 font-medium">{genreName}</p>
          <p className="font-semibold text-4xl mt-1">{selectedReview?.movieTitle}</p>
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
            <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center">
              {selectedReview?.profileImage ? (
                <img
                  src={selectedReview.profileImage}
                  alt="프로필 이미지"
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
              className="text-violet-300 w-5 h-5"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              style={{
                transition: "transform 0.2s, fill 0.2s",
              }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {selectedReview?.likes}
          </div>
        </div>
        <div className="flex gap-4 w-full mt-4 items-center">
          <div className="bg-violet-600  border-violet-600 text-center text-white px-4 py-2.5 w-1/3">
            <Link href={`/movie/${selectedReview?.tmdbMovieId}`}>상세정보</Link>
          </div>
          <div className="border border-gray-300 px-4 py-2.5 w-1/3 text-center">
            <button
              onClick={() => handleLikeToggle(selectedReview.id)}
              className=""
            >
              리스트 추가
            </button>
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
              <img
                key={review?.id || i}
                src={
                  review?.tmdbMovieId && posters[review.tmdbMovieId]
                    ? posters[review.tmdbMovieId]
                    : "/no-poster.png"
                }
                alt={review?.movieTitle || ""}
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
    </div>
  );
}
