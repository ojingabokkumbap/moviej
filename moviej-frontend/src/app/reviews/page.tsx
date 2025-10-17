"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { fetchMovieDetails as getMovieDetails } from "@/lib/tmdbAPI";
import { api } from "@/lib/api";
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

interface MovieDetail {
  poster_path: string;
}

function ReviewsPage() {
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  const movieId = searchParams.get("movieId");
  const movieTitle = searchParams.get("movieTitle");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [posters, setPosters] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 페이지 타이틀 설정
  useEffect(() => {
    if (movieTitle) {
      document.title = `${movieTitle} 리뷰 - MovieJ`;
    } else {
      document.title = "리뷰 - MovieJ";
    }
  }, [movieTitle]);

  // Intersection Observer로 무한 스크롤 감지
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // 초기 데이터 로드
  useEffect(() => {
    setReviews([]);
    setPage(0);
    setHasMore(true);
    fetchInitialData();
  }, [movieId]);

  // inView가 true가 되면 추가 데이터 로드
  useEffect(() => {
    if (inView && hasMore && !loading && reviews.length > 0) {
      fetchMoreData();
    }
  }, [inView, hasMore, loading]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (movieId) {
        const responses = await api.get(`/reviews/movie/${movieId}`, {
          params: {
            page: 0,
            size: 5,
            email: userEmail,
          },
        });
        const reviewData = responses.data.content || responses.data;
        setReviews(reviewData);
        setHasMore(
          responses.data.content ? !responses.data.last : reviewData.length >= 5
        );

        const movieData = await getMovieDetails(movieId);
        setMovie(movieData);
      } else {
        const responses = await api.get("/reviews", {
          params: {
            page: 0,
            size: 3,
            email: userEmail,
          },
        });
        const reviewData = responses.data.content || responses.data;
        setReviews(reviewData);
        setHasMore(
          responses.data.content ? !responses.data.last : reviewData.length >= 3
        );

        await fetchPostersForReviews(reviewData);
      }
    } catch {
      setReviews([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = async () => {
    if (loading) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      let newReviews: Review[] = [];
      if (movieId) {
        const responses = await api.get(`/reviews/movie/${movieId}`, {
          params: {
            page: nextPage,
            size: 3,
            email: userEmail,
          },
        });
        newReviews = responses.data.content || responses.data;
      } else {
        const responses = await api.get("/reviews", {
          params: {
            page: nextPage,
            size: 3,
            email: userEmail,
          },
        });
        newReviews = responses.data.content || responses.data;
        await fetchPostersForReviews(newReviews);
      }

      setReviews((prev) => {
        const ids = new Set(prev.map((r) => r.id));
        const filtered = newReviews.filter((r) => !ids.has(r.id));
        return [...prev, ...filtered];
      });

      setHasMore(newReviews.length >= 3);
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 리뷰들의 포스터 가져오기
  const fetchPostersForReviews = async (reviewList: Review[]) => {
    const posterMap: { [key: string]: string } = { ...posters };

    await Promise.all(
      reviewList.map(async (review: Review) => {
        if (!posterMap[review.tmdbMovieId]) {
          try {
            const movieData = await getMovieDetails(review.tmdbMovieId);
            posterMap[review.tmdbMovieId] = movieData.poster_path;
          } catch {
            posterMap[review.tmdbMovieId] = "";
          }
        }
      })
    );

    setPosters(posterMap);
  };

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
    } catch {
      showNotification("좋아요 처리에 실패했습니다.", "error");
    }
  };

  // 정렬된 리뷰 계산
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "latest") {
      // 최신순: createdAt 기준 내림차순
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // 인기순: likes 기준 내림차순
      return b.likes - a.likes;
    }
  });

  // 정렬 버튼 클릭 시 상태 업데이트
  const handleSortChange = (newSort: "latest" | "popular") => {
    setSortBy(newSort);
  };

  return (
    <div className="min-h-screen bg-black text-white mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {movieId ? `${movieTitle} ` : "감상평"}
          </h1>
        </div>
        {/* 정렬 옵션 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => handleSortChange("latest")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "latest"
                ? "bg-violet-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange("popular")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "popular"
                ? "bg-violet-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            인기순
          </button>
        </div>

        {/* 후기 목록 */}
        <div className="space-y-6">
          {sortedReviews.map((review, index) => (
            <div key={`${review.id}-${index}`} className="flex gap-5">
              <div className="bg-gray-800 border w-full border-gray-700 rounded-xl overflow-hidden p-4">
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
                          className={`transition-all duration-200 ${
                            review.liked
                              ? "text-violet-500 hover:text-violet-400" // 내가 누른 공감: 핑크/빨강
                              : "text-gray-400 hover:text-violet-500" // 안 누른 공감: 회색/보라
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              review.liked ? "scale-110" : "scale-100"
                            }`}
                            fill={review.liked ? "currentColor" : "none"} // isLiked에 따라 채움/빈 상태
                            stroke="currentColor" // button 색상 상속
                            strokeWidth="1"
                            viewBox="0 0 24 24"
                            style={{
                              transition: "transform 0.2s, fill 0.2s",
                            }}
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
      </div>

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
        </div>
      )}

      {/* Intersection Observer 트리거 */}
      {hasMore && !loading && reviews.length > 0 && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <p className="text-gray-500">스크롤하여 더 보기...</p>
        </div>
      )}

      {/* 모든 데이터 로드 완료 */}
      {!hasMore && reviews.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          모든 후기를 불러왔습니다.
        </div>
      )}

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
  );
}

export default function ReviewsPageWrapper() {
  return (
    <Suspense>
      <ReviewsPage />
    </Suspense>
  );
}
