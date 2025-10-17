"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getWishlist } from "@/lib/wishlistAPI";
import { api } from "@/lib/api";
import { fetchMovieDetails as getMovieDetails } from "@/lib/tmdbAPI";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  joinDate: Date;
  totalMoviesWatched: number;
  averageRating: number;
}

interface Review {
  id: number;
  tmdbMovieId: string;
  movieTitle: string;
  title: string;
  nickname: string;
  profileImage: string;
  rating: number;
  content: string;
  likes: number;
  createdAt: string;
  liked: boolean;
  posterPath?: string;
}

interface UserPreferences {
  id: number;
  user?: any;
  genres: { id: number; genreId: number; genreName: string }[];
  actors: { id: number; actorId: number; actorName: string }[];
  movies: {
    id: number;
    tmdbId: number | null;
    title: string;
    rating: number;
  }[];
  createdAt?: string;
}

export default function MovieNotePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "collection" | "stats" | "reviews" | "taste" | "calendar"
  >("dashboard");
  const [collectionMovies, setCollectionMovies] = useState<any[]>([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "내 정보 - MovieJ";
  }, []);

  // 리뷰들의 포스터 가져오기
  const fetchPostersForReviews = async (reviewList: Review[]) => {
    const updatedReviews = await Promise.all(
      reviewList.map(async (review) => {
        if (!review.posterPath && review.tmdbMovieId) {
          try {
            const movieData = await getMovieDetails(review.tmdbMovieId);
            return { ...review, posterPath: movieData.poster_path };
          } catch {
            return review;
          }
        }
        return review;
      })
    );
    return updatedReviews;
  };

  // 사용자 프로필 데이터 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userEmail = localStorage.getItem("userEmail");
      const userNickname = localStorage.getItem("userNickname");

      if (!userEmail) {
        router.push("/");
        return;
      }

      setIsLoadingProfile(true);
      try {
        // userId 가져오기
        const userId = localStorage.getItem("userId");

        // 리뷰, 컬렉션, 사용자 선호도 데이터 가져오기
        const [reviewsResponse, wishlistData, preferencesResponse] =
          await Promise.all([
            api.get("/reviews/my", {
              params: {
                email: userEmail,
              },
            }),
            getWishlist(userEmail).catch(() => []),
            userId
              ? api
                  .get("/user-preferences/check", {
                    params: { userId: parseInt(userId) },
                  })
                  .catch((err) => {
                    console.log("선호도 데이터 없음:", err);
                    return null;
                  })
              : Promise.resolve(null),
          ]);

        const reviewData = Array.isArray(reviewsResponse.data)
          ? reviewsResponse.data
          : [reviewsResponse.data];
        // 리뷰에 포스터 추가
        const reviewsWithPosters = await fetchPostersForReviews(reviewData);
        setUserReviews(reviewsWithPosters);
        setCollectionMovies(wishlistData);

        // 사용자 선호도 저장
        if (preferencesResponse && preferencesResponse.status === 200) {
          setUserPreferences(preferencesResponse.data);
          // 로컬스토리지에도 백업
          localStorage.setItem(
            "userPreferences",
            JSON.stringify(preferencesResponse.data)
          );
        } else {
          // API에 데이터가 없으면 로컬스토리지에서 가져오기
          const savedPreferences = localStorage.getItem("userPreferences");
          if (savedPreferences) {
            try {
              setUserPreferences(JSON.parse(savedPreferences));
            } catch (e) {
              console.error("선호도 데이터 파싱 실패:", e);
            }
          }
        }

        // 프로필 설정
        setUserProfile({
          id: userEmail,
          username: userNickname || userEmail.split("@")[0],
          email: userEmail,
          profileImage:
            localStorage.getItem("userProfileImage") ||
            "/images/default-avatar.jpg",
          joinDate: new Date(localStorage.getItem("joinDate") || Date.now()),
          totalMoviesWatched: reviewData.length,
          averageRating:
            reviewData.length > 0
              ? reviewData.reduce(
                  (sum: number, r: Review) => sum + r.rating,
                  0
                ) / reviewData.length
              : 0,
        });
      } catch (error) {
        console.error("프로필 로딩 실패:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // 컬렉션 데이터 새로고침
  useEffect(() => {
    const fetchCollection = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (
        !userEmail ||
        activeTab !== "collection" ||
        collectionMovies.length > 0
      )
        return;

      setIsLoadingCollection(true);
      try {
        const data = await getWishlist(userEmail);
        setCollectionMovies(data);
      } catch (error) {
        console.error("컬렉션 로딩 실패:", error);
      } finally {
        setIsLoadingCollection(false);
      }
    };

    fetchCollection();
  }, [activeTab, collectionMovies.length]);

  // 사용자 리뷰 데이터 새로고침
  useEffect(() => {
    const fetchUserReviews = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail || activeTab !== "reviews" || userReviews.length > 0)
        return;

      setIsLoadingReviews(true);
      try {
        const response = await api.get("/reviews/my", {
          params: {
            email: userEmail,
          },
        });
        const reviewData = Array.isArray(response.data)
          ? response.data
          : [response.data];
        // 리뷰에 포스터 추가
        const reviewsWithPosters = await fetchPostersForReviews(reviewData);
        setUserReviews(reviewsWithPosters);
      } catch (error) {
        console.error("리뷰 로딩 실패:", error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchUserReviews();
  }, [activeTab, userReviews.length]);

  const getActivityDays = () => {
    if (!userProfile) return 0;
    const joinDate = userProfile.joinDate;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLevelColor = (rating: number) => {
    if (rating >= 4.5) return "text-purple-400";
    if (rating >= 4.0) return "text-blue-400";
    if (rating >= 3.5) return "text-green-400";
    return "text-yellow-400";
  };

  if (isLoadingProfile || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">내정보</h1>
        </div>
        {/* 프로필 카드 */}
        <div className="p-8 ">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700">
              {userProfile.profileImage ?
               (
                <Image
                  src={userProfile.profileImage}
                  alt="프로필 이미지"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {userProfile.username}
              </h2>
              <div className="flex text-gray-400 flex-col">
                <span>가입일 {userProfile.joinDate.toLocaleDateString()}</span>
                <span>활동 {getActivityDays()}일째</span>
              </div>
            </div>
          </div>
          {/* 통계 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400">내 컬렉션</div>
              <div className="text-3xl font-bold text-violet-400 mb-2">
                {collectionMovies.length}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400">작성한 리뷰</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {userReviews.length}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400">평균 평점</div>
              <div
                className={`text-3xl font-bold mb-2 ${
                  userReviews.length > 0
                    ? getLevelColor(
                        userReviews.reduce((sum, r) => sum + r.rating, 0) /
                          userReviews.length
                      )
                    : "text-gray-400"
                }`}
              >
                {userReviews.length > 0
                  ? (
                      userReviews.reduce((sum, r) => sum + r.rating, 0) /
                      userReviews.length
                    ).toFixed(1)
                  : "0.0"}
                ★
              </div>
            </div>
          </div>
        </div>
        {/* 탭 네비게이션 */}
        <div className="flex gap-6 mb-8 border-b border-gray-700">
          {[
            { id: "dashboard", label: "대시보드" },
            { id: "collection", label: "내 컬렉션" },
            { id: "reviews", label: "내 리뷰" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 대시보드 */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* 취향 분석 */}
            <h3 className="text-xl font-bold mb-6">나의 영화 취향 분석</h3>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 선호 장르 차트 */}
                <div>
                  <h4 className="font-semibold mb-4">선호 장르 분석</h4>
                  {userPreferences && userPreferences.genres.length > 0 ? (
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: userPreferences.genres.map(
                            (g) => g.genreName
                          ),
                          datasets: [
                            {
                              label: "선호도",
                              data: userPreferences.genres.map((_, index) =>
                                Math.max(10 - index * 2, 1)
                              ),
                              backgroundColor: [
                                "rgba(139, 92, 246, 0.8)",
                                "rgba(168, 85, 247, 0.8)",
                                "rgba(217, 70, 239, 0.8)",
                                "rgba(236, 72, 153, 0.8)",
                                "rgba(244, 114, 182, 0.8)",
                              ],
                            },
                          ],
                        }}
                        options={{
                          plugins: {
                            legend: { display: false },
                            title: { display: false },
                          },
                          scales: {
                            x: {
                              grid: { display: false },
                              ticks: {
                                color: "#9CA3AF",
                              },
                              border: { display: false },
                            },
                            y: {
                              beginAtZero: true,
                              max: 10,
                              grid: { color: "rgba(75, 85, 99, 0.2)" },
                              ticks: {
                                color: "#9CA3AF",
                                font: { size: 11 },
                                stepSize: 2,
                              },
                              border: { display: false },
                            },
                          },
                          animation: {
                            duration: 1500,
                            easing: "easeOutQuart",
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <p className="mb-2">선호 장르 정보가 없습니다</p>
                        <p className="text-sm">
                          온보딩에서 취향을 설정해보세요
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 평점 분포 도넛 차트 */}
                <div>
                  <h4 className="font-semibold mb-4">평점 분포</h4>
                  {userReviews.length > 0 ? (
                    <div className="h-64 flex items-center justify-center">
                      <Doughnut
                        data={{
                          labels: ["5점", "4점", "3점", "2점", "1점"],
                          datasets: [
                            {
                              data: [
                                userReviews.filter((r) => r.rating === 5)
                                  .length,
                                userReviews.filter((r) => r.rating === 4)
                                  .length,
                                userReviews.filter((r) => r.rating === 3)
                                  .length,
                                userReviews.filter((r) => r.rating === 2)
                                  .length,
                                userReviews.filter((r) => r.rating === 1)
                                  .length,
                              ],
                              backgroundColor: [
                                "rgba(34, 197, 94, 0.8)", // green-500
                                "rgba(59, 130, 246, 0.8)", // blue-500
                                "rgba(234, 179, 8, 0.8)", // yellow-500
                                "rgba(249, 115, 22, 0.8)", // orange-500
                                "rgba(239, 68, 68, 0.8)", // red-500
                              ],
                              borderColor: [
                                "rgba(34, 197, 94, 1)",
                                "rgba(59, 130, 246, 1)",
                                "rgba(234, 179, 8, 1)",
                                "rgba(249, 115, 22, 1)",
                                "rgba(239, 68, 68, 1)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                color: "#E5E7EB",
                                font: {
                                  size: 12,
                                },
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: "circle",
                              },
                            },
                            tooltip: {
                              backgroundColor: "rgba(17, 24, 39, 0.95)",
                              titleColor: "#ffffff",
                              bodyColor: "#ffffff",
                              borderColor: "rgba(139, 92, 246, 0.5)",
                              borderWidth: 1,
                              padding: 12,
                              callbacks: {
                                label: function (context: any) {
                                  const total = userReviews.length;
                                  const value = context.parsed;
                                  const percentage = (
                                    (value / total) *
                                    100
                                  ).toFixed(1);
                                  return `${context.label}: ${value}편 (${percentage}%)`;
                                },
                              },
                            },
                          },
                          animation: {
                            duration: 1500,
                            easing: "easeOutQuart",
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <p className="mb-2">평점 데이터가 없습니다</p>
                        <p className="text-sm">
                          영화를 평가하고 리뷰를 작성해보세요
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI 분석 멘트 */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg border border-purple-700/30">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {userPreferences && userPreferences.genres.length > 0 ? (
                        <>
                          당신은{" "}
                          <span className="font-semibold text-violet-400">
                            {userPreferences.genres
                              .map((g) => g.genreName)
                              .join(", ")}
                          </span>{" "}
                          장르를 선호하시는군요!
                          {userReviews.length > 0 && (
                            <>
                              {" "}
                              평균 평점은{" "}
                              <span className="font-semibold text-yellow-400">
                                {(
                                  userReviews.reduce(
                                    (sum, r) => sum + r.rating,
                                    0
                                  ) / userReviews.length
                                ).toFixed(1)}
                                점
                              </span>
                              으로, 작품을 선별적으로 감상하시는 스타일입니다.
                            </>
                          )}
                        </>
                      ) : (
                        "취향분석을 통해 당신의 영화 취향을 분석하고 맞춤형 추천을 제공합니다."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <h3 className="text-xl font-bold mb-2 ">최근 리뷰 작성 영화</h3>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              {userReviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  아직 작성한 리뷰가 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {userReviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      className="group cursor-pointer"
                      onClick={() =>
                        router.push(`/movie/${review.tmdbMovieId}`)
                      }
                    >
                      {review.posterPath && (
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                          <Image
                            src={`https://image.tmdb.org/t/p/w300${review.posterPath}`}
                            alt={review.movieTitle}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-violet-500 bg-opacity-70 px-2 py-1 rounded text-xs">
                            ★ {review.rating}
                          </div>
                        </div>
                      )}
                      <h4 className="font-medium text-sm truncate">
                        {review.movieTitle}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("ko-KR")}{" "}
                        작성
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 내 컬렉션 */}
        {activeTab === "collection" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">내 컬렉션</h2>
              <p className="text-gray-400">
                총 {collectionMovies.length}개의 영화
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="space-y-6">
                {isLoadingCollection ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600"></div>
                  </div>
                ) : collectionMovies.length === 0 ? (
                  <div className="text-center py-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-16 h-16 mx-auto mb-4 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      />
                    </svg>
                    <p className="text-gray-400 text-lg mb-2">
                      아직 컬렉션에 추가된 영화가 없습니다
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      영화 상세 페이지에서 &quot;컬렉션 추가&quot; 버튼을
                      눌러보세요
                    </p>
                    <button
                      onClick={() => router.push("/movies")}
                      className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                    >
                      영화 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {collectionMovies.map((movie) => (
                      <div
                        key={movie.id}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/movie/${movie.movieId}`)}
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                          <Image
                            src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                            alt={movie.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {movie.rating && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                              </svg>
                              {movie.rating}
                            </div>
                          )}
                        </div>
                        <h4 className="font-medium text-sm truncate mb-1 group-hover:text-violet-400 transition-colors">
                          {movie.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 내 리뷰 */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 text-center relative">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 h-8 border-r border-gray-500"></div>
                <div className="text-3xl font-bold text-gray-300 mb-2">
                  {userReviews.length}
                </div>
                <div className="text-gray-400">작성한 리뷰</div>
              </div>
              <div className="p-6 text-center relative">
                <div className="text-3xl font-bold text-gray-300 mb-2">
                  {userReviews.reduce((sum, r) => sum + r.likes, 0)}
                </div>
                <div className="text-gray-400">받은 공감</div>
              </div>
            </div>

            {isLoadingReviews ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600"></div>
              </div>
            ) : userReviews.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 mx-auto mb-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <p className="text-gray-400 text-lg mb-2">
                  작성한 리뷰가 없습니다
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  영화를 보고 감상평을 남겨보세요
                </p>
                <button
                  onClick={() => router.push("/movies")}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  영화 둘러보기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-700 cursor-pointer hover:border-violet-500 transition-colors"
                    onClick={() => router.push(`/movie/${review.tmdbMovieId}`)}
                  >
                    <div className="flex gap-8">
                      {review.posterPath && (
                        <div className="relative w-24 h-36 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${review.posterPath}`}
                            alt={review.movieTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold text-lg">
                            {review.movieTitle}
                          </h4>
                          {review.title && (
                            <span className="text-sm text-gray-400">
                              {review.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-600"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-3 h-20">
                          {review.content}
                        </p>
                        <div className="flex items-center  gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <span>받은 공감</span>
                            <span>{review.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
