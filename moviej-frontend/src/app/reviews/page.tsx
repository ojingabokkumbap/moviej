"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Review {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  author: string;
  content: string;
  rating: number;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

// 샘플 후기 데이터
const sampleReviews: Review[] = [
  {
    id: "review1",
    movieId: "1",
    movieTitle: "인터스텔라",
    moviePoster:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    author: "우주덕후",
    content:
      "과학적 설정과 감동적인 스토리가 완벽하게 조화된 작품! 매튜 맥커너히의 연기와 한스 짐머의 OST가 정말 압도적이었습니다. 시간과 공간을 넘나드는 서사가 너무 감동적이에요 😭",
    rating: 5,
    likes: 127,
    isLiked: false,
    createdAt: new Date(2024, 7, 25),
  },
  {
    id: "review2",
    movieId: "2",
    movieTitle: "기생충",
    moviePoster:
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    author: "영화평론가",
    content:
      "봉준호 감독의 연출력이 정말 대단했습니다. 사회적 메시지를 영화 속에 자연스럽게 녹여낸 점이 인상적이었어요. 배우들의 연기도 모두 훌륭했고 특히 송강호님의 연기가 최고!",
    rating: 5,
    likes: 89,
    isLiked: true,
    createdAt: new Date(2024, 7, 23),
  },
  {
    id: "review3",
    movieId: "1",
    movieTitle: "인터스텔라",
    moviePoster:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    author: "SF매니아",
    content:
      "블랙홀과 웜홀의 시각적 표현이 정말 놀라웠어요. 과학 자문을 제대로 받아서 만든 티가 확실히 납니다. 딸과 아버지의 감정적 교감도 너무 좋았고요!",
    rating: 4,
    likes: 56,
    isLiked: false,
    createdAt: new Date(2024, 7, 20),
  },
  {
    id: "review4",
    movieId: "3",
    movieTitle: "어벤져스: 엔드게임",
    moviePoster:
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    author: "마블팬",
    content:
      "11년간의 MCU 여정의 완벽한 마무리! 모든 히어로들이 한자리에 모이는 장면에서 소름이 돋았습니다. 아이언맨의 마지막 장면은 정말 눈물이... 😢",
    rating: 5,
    likes: 203,
    isLiked: false,
    createdAt: new Date(2024, 7, 18),
  },
  {
    id: "review5",
    movieId: "4",
    movieTitle: "라라랜드",
    moviePoster:
      "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    author: "뮤지컬러버",
    content:
      "음악과 영상미가 환상적인 조합이었어요! 에마 스톤과 라이언 고슬링의 케미스트리도 완벽했고, 특히 City of Stars 넘버는 정말 아름다웠습니다 🎵",
    rating: 4,
    likes: 78,
    isLiked: true,
    createdAt: new Date(2024, 7, 15),
  },
  {
    id: "review6",
    movieId: "2",
    movieTitle: "기생충",
    moviePoster:
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    author: "시네마틱",
    content:
      "계층 사회의 현실을 너무나 적나라하게 보여준 작품. 웃음과 긴장, 공포가 절묘하게 섞여있어서 마지막까지 몰입해서 볼 수 있었어요.",
    rating: 5,
    likes: 94,
    isLiked: false,
    createdAt: new Date(2024, 7, 12),
  },
];

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const movieTitle = searchParams.get("movieTitle");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    // 특정 영화의 후기만 필터링하거나 전체 후기 표시
    let filteredReviews = movieId
      ? sampleReviews.filter((review) => review.movieId === movieId)
      : sampleReviews;

    // 정렬
    if (sortBy === "latest") {
      filteredReviews = filteredReviews.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } else {
      filteredReviews = filteredReviews.sort((a, b) => b.likes - a.likes);
    }

    setReviews(filteredReviews);
  }, [movieId, sortBy]);

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
  };

  return (
    <div className="min-h-screen bg-black text-white mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {movieId ? `${movieTitle} 후기` : "감상평"}
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
        </div>

        {/* 후기 목록 */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-5 ">
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden p-4 ">
                <div className="flex gap-4">
                  {/* 영화 포스터 (전체 후기 페이지에서만 표시) */}
                  {!movieId && (
                    <Link href={`/movie/${review.movieId}`}>
                      <div className="relative w-24 h-36 mt-8 ml-5 overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                        <Image
                          src={review.moviePoster}
                          alt={review.movieTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  {/* 헤더 */}
                  <div>
                    <div className="flex items-center justify-between px-6 pt-6 pb-2">
                      <div className="flex items-center w-full justify-between">
                        <p className="text-3xl font-semibold">
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
                    <div className="px-8 py-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className="mb-3 text-gray-400"
                      >
                        <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z" />
                      </svg>
                      <p className="text-gray-200 leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                    {/* 작성자 / 좋아요 */}
                    <div className="flex justify-between items-center px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {review.author.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-gray-300">{review.author}</h4>
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
                        {review.likes > 0 && (
                          <div className="text-sm font-semibold text-gray-300">
                            좋아요 {review.likes}
                          </div>
                        )}
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
