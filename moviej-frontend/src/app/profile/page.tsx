"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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

interface WatchedMovie {
  id: number;
  title: string;
  poster_path: string;
  userRating: number;
  watchedDate: Date;
  genre: string[];
  runtime: number;
  review?: string;
  isFavorite: boolean;
  rewatch: boolean;
}

export default function MovieNotePage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "collection" | "stats" | "reviews" | "taste" | "calendar"
  >("dashboard");
  const [collectionFilter, setCollectionFilter] = useState<
    "all" | "watched" | "wishlist" | "upcoming" | "rewatch"
  >("all");

  // 샘플 사용자 데이터
  const [userProfile] = useState<UserProfile>({
    id: "user1",
    username: "영화매니아",
    email: "movie@example.com",
    profileImage: "/images/default-avatar.jpg",
    joinDate: new Date(2023, 5, 15),
    totalMoviesWatched: 247,
    averageRating: 4.2,
  });

  // 샘플 시청 영화 데이터
  const [watchedMovies] = useState<WatchedMovie[]>([
    {
      id: 157336,
      title: "인터스텔라",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      userRating: 5,
      watchedDate: new Date(2024, 8, 15),
      genre: ["SF", "드라마"],
      runtime: 169,
      review: "정말 감동적인 영화였습니다. 과학적 설정도 훌륭하고...",
      isFavorite: true,
      rewatch: true,
    },
    {
      id: 496243,
      title: "기생충",
      poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      userRating: 5,
      watchedDate: new Date(2024, 8, 10),
      genre: ["스릴러", "드라마"],
      runtime: 132,
      review: "봉준호 감독의 걸작! 사회적 메시지가 강렬했어요.",
      isFavorite: true,
      rewatch: false,
    },
    {
      id: 299534,
      title: "어벤져스: 엔드게임",
      poster_path: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      userRating: 4,
      watchedDate: new Date(2024, 8, 5),
      genre: ["액션", "SF"],
      runtime: 181,
      isFavorite: false,
      rewatch: false,
    },
    {
      id: 313369,
      title: "라라랜드",
      poster_path: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      userRating: 4,
      watchedDate: new Date(2024, 7, 28),
      genre: ["로맨스", "뮤지컬"],
      runtime: 128,
      isFavorite: true,
      rewatch: true,
    },
    {
      id: 278,
      title: "쇼생크 탈출",
      poster_path: "/q6y0Go1yg8s6B9PK6URJbM0BJ6B.jpg",
      userRating: 5,
      watchedDate: new Date(2024, 7, 20),
      genre: ["드라마"],
      runtime: 142,
      isFavorite: true,
      rewatch: true,
    },
  ]);

  const getActivityDays = () => {
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

  const filteredMovies = watchedMovies.filter((movie) => {
    switch (collectionFilter) {
      case "watched":
        return true;
      case "wishlist":
        return movie.isFavorite;
      case "rewatch":
        return movie.rewatch;
      default:
        return true;
    }
  });

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
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {userProfile.username.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {userProfile.username}
              </h2>
              <div className="flex text-gray-400 flex-col">
                <span>가입일: {userProfile.joinDate.toLocaleDateString()}</span>
                <span>활동 {getActivityDays()}일째</span>
              </div>
            </div>
          </div>
          {/* 통계 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400">총 시청 영화</div>
              <div className="text-3xl font-bold text-violet-400 mb-2">
                {userProfile.totalMoviesWatched}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400">평균 평점</div>
              <div
                className={`text-3xl font-bold mb-2 ${getLevelColor(
                  userProfile.averageRating
                )}`}
              >
                {userProfile.averageRating.toFixed(1)}★
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-gray-400">총 시청 시간</div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {Math.floor(
                  watchedMovies.reduce((acc, movie) => acc + movie.runtime, 0) /
                    60
                )}
                h
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
                <div>
                  <h4 className="font-semibold mb-4">선호 장르 순위</h4>
                  {/* Chart.js 세로 막대그래프 */}
                  <div className="h-64 mb-4">
                    <Bar
                      data={{
                        labels: [
                          "액션",
                          "드라마",
                          "판타지",
                          "스릴러",
                          "SF",
                          "애니",
                          "호러",
                          "추리",
                        ],
                        datasets: [
                          {
                            label: "시청 편수",
                            data: [5, 8, 3, 4, 6, 2, 1, 3],
                            backgroundColor: [
                              "rgba(239, 68, 68, 0.8)", // red-500
                              "rgba(99, 102, 241, 0.8)", // indigo-500
                              "rgba(168, 85, 247, 0.8)", // purple-500
                              "rgba(245, 101, 101, 0.8)", // red-400
                              "rgba(59, 130, 246, 0.8)", // blue-500
                              "rgba(236, 72, 153, 0.8)", // pink-500
                              "rgba(75, 85, 99, 0.8)", // gray-600
                              "rgba(16, 185, 129, 0.8)", // emerald-500
                            ],
                            borderColor: [
                              "rgba(239, 68, 68, 1)",
                              "rgba(99, 102, 241, 1)",
                              "rgba(168, 85, 247, 1)",
                              "rgba(245, 101, 101, 1)",
                              "rgba(59, 130, 246, 1)",
                              "rgba(236, 72, 153, 1)",
                              "rgba(75, 85, 99, 1)",
                              "rgba(16, 185, 129, 1)",
                            ],
                            borderWidth: 0.5,
                            borderRadius: 4,
                            borderSkipped: false,
                            maxBarThickness: 30, // 막대 최대 굵기를 20px로 제한
                          },
                        ],
                      }}
                      options={
                        {
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: "rgba(17, 24, 39, 0.9)",
                              titleColor: "#ffffff",
                              bodyColor: "#ffffff",
                              borderColor: "rgba(75, 85, 99, 0.5)",
                              borderWidth: 1,
                              callbacks: {
                                label: function (context: any) {
                                  return `${context.parsed.y}편 시청`;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: "#9CA3AF",
                                font: {
                                  size: 12,
                                },
                              },
                              border: {
                                display: false,
                              },
                            },
                            y: {
                              beginAtZero: true,
                              max: 10,
                              grid: {
                                color: "rgba(75, 85, 99, 0.3)",
                              },
                              ticks: {
                                color: "#9CA3AF",
                                font: {
                                  size: 11,
                                },
                                stepSize: 1,
                              },
                              border: {
                                display: false,
                              },
                            },
                          },
                          animation: {
                            duration: 1000,
                            easing: "easeOutQuart",
                          },
                        } as any
                      }
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">평점 분포</h4>
                  <div className="h-64 flex flex-col justify-center">
                    <div className="space-y-4">
                      {[
                        {
                          rating: "5점 (최고)",
                          count: 3,
                          color: "bg-slate-500",
                          percentage: 60,
                        },
                        {
                          rating: "4점 (좋음)",
                          count: 2,
                          color: "bg-slate-600",
                          percentage: 40,
                        },
                        {
                          rating: "3점 (보통)",
                          count: 0,
                          color: "bg-gray-700",
                          percentage: 0,
                        },
                        {
                          rating: "2점 이하",
                          count: 0,
                          color: "bg-gray-800",
                          percentage: 0,
                        },
                      ].map((data) => (
                        <div key={data.rating} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {data.rating}
                            </span>
                            <span className="text-sm text-gray-400">
                              {data.count}편 ({data.percentage}%)
                            </span>
                          </div>
                          <div className="relative bg-gray-800 rounded-lg h-6 overflow-hidden">
                            <div
                              className={`${data.color} h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-3`}
                              style={{ width: `${data.percentage}%` }}
                            >
                              {data.count > 0 && (
                                <span className="text-xs font-bold text-white">
                                  {data.count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}{" "}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg border border-purple-800/30">
                <p className="text-base text-gray-300 text-center">
                  깊이 있는 스토리와 높은 완성도를 추구하는 관람객입니다. 감정적
                  몰입도가 높은 드라마와 상상력이 풍부한 SF 장르를 추천드립니다.
                </p>
              </div>
            </div>

            {/* 최근 활동 */}
            <h3 className="text-xl font-bold mb-2">최근 시청한 영화</h3>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchedMovies.slice(0, 5).map((movie) => (
                  <div key={movie.id} className="group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
                        {movie.userRating}★
                      </div>
                    </div>
                    <h4 className="font-medium text-sm truncate">
                      {movie.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {movie.watchedDate.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 내 컬렉션 */}
        {activeTab === "collection" && (
          <div className="space-y-6">
            {/* 필터 버튼들 */}
            <div className="flex gap-4 flex-wrap">
              {[
                { id: "all", label: "전체", count: watchedMovies.length },
                {
                  id: "watched",
                  label: "시청완료",
                  count: watchedMovies.length,
                },
                {
                  id: "wishlist",
                  label: "찜한영화",
                  count: watchedMovies.filter((m) => m.isFavorite).length,
                },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setCollectionFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    collectionFilter === filter.id
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "border-gray-600 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* 영화 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredMovies.map((movie) => (
                <div key={movie.id} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <div className="bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
                        {movie.userRating}★
                      </div>
                      {movie.isFavorite && (
                        <div className="bg-red-500 bg-opacity-80 px-1 py-1 rounded text-xs">
                          ♥
                        </div>
                      )}
                      {movie.rewatch && (
                        <div className="bg-blue-500 bg-opacity-80 px-1 py-1 rounded text-xs">
                          재시청
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm truncate mb-1">
                    {movie.title}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {movie.watchedDate.toLocaleDateString()}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {movie.genre.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="text-xs bg-gray-700 px-2 py-1 rounded"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 내 리뷰 */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 text-center relative">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 h-8 border-r border-gray-500"></div>
                <div className="text-3xl font-bold text-gray-300 mb-2">
                  {watchedMovies.filter((m) => m.review).length}
                </div>
                <div className="text-gray-400">작성한 리뷰</div>
              </div>
              <div className="p-6 text-center relative">
                <div className="text-3xl font-bold text-gray-300 mb-2">10</div>
                <div className="text-gray-400">받은 좋아요</div>
              </div>
            </div>

            <div className="space-y-4">
              {watchedMovies
                .filter((movie) => movie.review)
                .map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-700"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-16 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < movie.userRating
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
                          <span className="text-sm text-gray-400">
                            {movie.watchedDate.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {movie.review}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                          <button className="flex items-center gap-1 hover:text-red-400">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              />
                            </svg>
                            24
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-400">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            7
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
