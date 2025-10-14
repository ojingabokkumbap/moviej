"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
/* import { useInView } from "react-intersection-observer"; */
import { fetchMovieDetails as getMovieDetails } from "@/lib/tmdbAPI";
import { api } from "@/lib/api";

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
  isLiked?: boolean;
}

interface MovieDetail {
  poster_path: string;
}

function ReviewsPage() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const movieTitle = searchParams.get("movieTitle");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  const [movie, setMovie] = useState<MovieDetail | null>(null); // 타입 지정
  const [posters, setPosters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchData() {
      try {
        if (movieId) {
          // 특정 영화의 리뷰만 가져오기
          const responses = await api.get(`/reviews/movie/${movieId}`);
          setReviews(responses.data);

          // TMDB API로 영화 정보 가져오기
          const movieData = await getMovieDetails(movieId);
          setMovie(movieData);
        } else {
          // 전체 리뷰 가져오기
          const responses = await api.get("/reviews");
          setReviews(responses.data);
          setMovie(null);

          // 각 리뷰의 포스터 가져오기
          const posterMap: { [key: string]: string } = {};
          await Promise.all(
            responses.data.map(async (review: Review) => {
              try {
                const movieData = await getMovieDetails(review.tmdbMovieId);
                posterMap[review.tmdbMovieId] = movieData.poster_path;
              } catch {
                posterMap[review.tmdbMovieId] = ""; // 실패 시 빈 값
              }
            })
          );
          setPosters(posterMap);
        }
      } catch (err) {
        console.log("데이터 가져오기 실패:", err);
        setReviews([]);
      }
    }

    fetchData();
  }, [movieId]);

  /* let filteredReviews = movieId
      ? reviews.filter((review) => review.tmdbMovieId === movieId)
      : reviews;

    // 정렬
    if (sortBy === "latest") {
      filteredReviews = filteredReviews.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } else {
      filteredReviews = filteredReviews.sort((a, b) => b.likes - a.likes);
    }

    setReviews(filteredReviews);
  }, [movieId, sortBy]); */
  /* 
  const handleLikeToggle = (reviewId: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            likes: review.isLiked ? review.likes - 1 : review.likes + 1,
            isLiked: !review.isLiked,
          };
        }
        return review;
      })
    );
  }; */

  return (
    <div className="min-h-screen bg-black text-white mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {movieId ? `${movieTitle} ` : "인기 감상평"}
          </h1>
        </div>
        {/* 정렬 옵션 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSortBy("latest")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "latest"
                ? "bg-violet-600 text-white"
                : " text-gray-300 hover:bg-gray-700"
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "popular"
                ? "bg-violet-600 text-white"
                : " text-gray-300 hover:bg-gray-700"
            }`}
          >
            인기순
          </button>
          <div className="text-gray-100 text-right w-full text-lg ">
            <div>
              <span className="text-gray-300 font-normal text-base mr-1">
                평균
              </span>
              ★
              {(
                reviews.reduce((sum, r) => sum + r.rating, 0) /
                (reviews.length || 1)
              ).toFixed(1)}
              <span className="text-gray-300 text-base ml-1">
                ({reviews.length}명)
              </span>
            </div>
          </div>
        </div>

        {/* 후기 목록 */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-5">
              <div className="bg-gray-800 border w-full border-gray-700 rounded-xl overflow-hidden p-4 ">
                <div className="flex">
                  {/* 영화 포스터 (전체 후기 페이지에서만 표시) */}
                  {!movieId && (
                    <Link href={`/movie/${review.tmdbMovieId}`}>
                      <div className="relative w-20 h-28 mt-4 ml-5 overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                        <Image
                          src={
                            posters[review.tmdbMovieId]
                              ? `https://image.tmdb.org/t/p/w154${
                                  posters[review.tmdbMovieId]
                                }`
                              : "/images/default-poster.jpg"
                          }
                          alt={review.movieTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  {/* 헤더 */}
                  <div className="w-full">
                    <div className="flex items-center justify-between px-6 pt-4 pb-4">
                      <div className="flex items-center w-full justify-between">
                        <p className="text-xl font-semibold">
                          {review.movieTitle}
                        </p>
                        <div className="flex items-center bg-gray-100 border border-gray-300 px-3 py-0.5 rounded-full w-fit">
                          {Array.from({ length: 1 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 text-gray-600`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* 컨텐츠 */}
                    <div className="px-6 py-2 relative min-h-16">
                      <div className="absolute top-2 left-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="mb-3 text-gray-400"
                        >
                          <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z" />
                        </svg>
                      </div>
                      <p className="text-gray-200 leading-relaxed px-6">
                        {review.content}
                      </p>
                    </div>
                    {/* 작성자 / 좋아요 */}
                    <div className="flex justify-between items-center px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {review.nickname.charAt(0)}
                          </span>
                        </div> */}
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center">
                          {review.profileImage ? (
                            <Image
                              src={review.profileImage}
                              alt="프로필 이미지"
                              width={40}
                              height={40}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-white font-medium rounded-full">
                              {review.nickname?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-gray-300">{review.nickname}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLikeToggle(review.id)}
                          className={`flex items-center gap-2 transition-all duration-200 ${
                            review.isLiked
                              ? "text-gray-100 hover:text-red-400"
                              : "text-gray-400 hover:text-gray-300"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              review.isLiked ? "scale-110" : ""
                            }`}
                            fill={review.isLiked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                        {/* 좋아요 수 */}
                        <div className="text-sm font-semibold text-gray-300">
                          공감 {review.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 후기가 없을 때 */}
        {reviews.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">
              {movieId
                ? "아직 이 영화에 대한 후기가 없습니다."
                : "등록된 후기가 없습니다."}
            </div>
            <p className="text-gray-500">첫 번째 후기를 남겨보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewsPageWrapper() {
  return (
    <Suspense>
      <ReviewsPage />
    </Suspense>
  );
}

// 레이지 로딩을 위한 개별 리뷰 카드 컴포넌트
function ReviewCard({ review, movieId, posters }: { 
  review: Review; 
  movieId: string | null; 
  posters: { [key: string]: string }; 
}) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true, // 한 번만 트리거
  });

  const handleLikeToggle = async (reviewId: number) => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        // showNotification("로그인이 필요합니다.", "warning");
        return;
      }

      // 백엔드 좋아요 API 호출
      await api.post(`/reviews/${reviewId}/like?email=${userEmail}`);
      
      // 리뷰 목록 새로고침이 필요하다면 부모 컴포넌트에서 처리
      
    } catch (err) {
      console.error("좋아요 처리 실패:", err);
      // showNotification("좋아요 처리에 실패했습니다.", "error");
    }
  };

  return (
    <div ref={ref} className="flex gap-5 min-h-[200px]">
      {inView ? (
        <div className="bg-gray-800 border w-full border-gray-700 rounded-xl overflow-hidden p-4">
          <div className="flex">
            {/* 영화 포스터 (전체 후기 페이지에서만 표시) */}
            {!movieId && (
              <Link href={`/movie/${review.tmdbMovieId}`}>
                <div className="relative w-20 h-28 mt-4 ml-5 overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                  <Image
                    src={
                      posters[review.tmdbMovieId]
                        ? `https://image.tmdb.org/t/p/w154${posters[review.tmdbMovieId]}`
                        : "/images/default-poster.jpg"
                    }
                    alt={review.movieTitle}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>
            )}
            {/* 헤더 */}
            <div className="w-full">
              <div className="flex items-center justify-between px-6 pt-4 pb-4">
                <div className="flex items-center w-full justify-between">
                  <p className="text-xl font-semibold">
                    {review.movieTitle}
                  </p>
                  <div className="flex items-center bg-gray-100 border border-gray-300 px-3 py-0.5 rounded-full w-fit">
                    {Array.from({ length: 1 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 text-gray-600`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {review.rating}
                    </span>
                  </div>
                </div>
              </div>
              {/* 컨텐츠 */}
              <div className="px-6 py-2 relative min-h-16">
                <div className="absolute top-2 left-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="mb-3 text-gray-400"
                  >
                    <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z" />
                  </svg>
                </div>
                <p className="text-gray-200 leading-relaxed px-6">
                  {review.content}
                </p>
              </div>
              {/* 작성자 / 좋아요 */}
              <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full flex items-center justify-center">
                    {review.profileImage ? (
                      <Image
                        src={review.profileImage}
                        alt="프로필 이미지"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-white font-medium rounded-full">
                        {review.nickname?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-gray-300">{review.nickname}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLikeToggle(review.id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      review.isLiked
                        ? "text-gray-100 hover:text-red-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        review.isLiked ? "scale-110" : ""
                      }`}
                      fill={review.isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  {/* 좋아요 수 */}
                  <div className="text-sm font-semibold text-gray-300">
                    공감 {review.likes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 로딩 스켈레톤
        <div className="bg-gray-800 border w-full border-gray-700 rounded-xl overflow-hidden p-4 animate-pulse">
          <div className="flex">
            {!movieId && (
              <div className="w-20 h-28 mt-4 ml-5 bg-gray-700 rounded"></div>
            )}
            <div className="w-full px-6 py-4">
              <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-4/5"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
