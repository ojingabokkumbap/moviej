"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const localizer = momentLocalizer(moment);

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  joinDate: Date;
  totalMoviesWatched: number;
  averageRating: number;
  level: {
    name: string;
    icon: string;
    color: string;
    progress: number;
  };
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

interface MovieEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  movie: WatchedMovie;
}



export default function MovieNotePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "collection" | "stats" | "reviews" | "taste" | "calendar">("dashboard");
  const [collectionFilter, setCollectionFilter] = useState<"all" | "watched" | "wishlist" | "upcoming" | "rewatch">("all");
  
  // 샘플 사용자 데이터
  const [userProfile] = useState<UserProfile>({
    id: "user1",
    username: "영화매니아",
    email: "movie@example.com", 
    profileImage: "/images/default-avatar.jpg",
    joinDate: new Date(2023, 5, 15),
    totalMoviesWatched: 247,
    averageRating: 4.2,
    level: {
      name: "시네마틱 마스터",
      icon: "🎭",
      color: "bg-purple-600",
      progress: 75
    }
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
      rewatch: true
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
      rewatch: false
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
      rewatch: false
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
      rewatch: true
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
      rewatch: true
    }
  ]);



  // 캘린더 이벤트 생성
  const calendarEvents: MovieEvent[] = watchedMovies.map(movie => ({
    id: `${movie.id}-${movie.watchedDate.getTime()}`,
    title: movie.title,
    start: movie.watchedDate,
    end: movie.watchedDate,
    movie: movie
  }));

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

  const filteredMovies = watchedMovies.filter(movie => {
    switch (collectionFilter) {
      case "watched": return true;
      case "wishlist": return movie.isFavorite;
      case "rewatch": return movie.rewatch;
      default: return true;
    }
  });

  return (
    <div className="min-h-screen bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">영화노트</h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-6 mb-8 border-b border-gray-700">
          {[
            { id: "dashboard", label: "대시보드" },
            { id: "collection", label: "내 컬렉션" },
            { id: "reviews", label: "내 리뷰" },
            { id: "taste", label: "취향 분석" },
            { id: "calendar", label: "시청 캘린더" }
          ].map(tab => (
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
            {/* 프로필 카드 */}
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {userProfile.username.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{userProfile.username}</h2>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>가입일: {userProfile.joinDate.toLocaleDateString()}</span>
                    <span>활동 {getActivityDays()}일째</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl">{userProfile.level.icon}</span>
                    <span className="font-semibold text-violet-400">{userProfile.level.name}</span>
                    <div className="flex-1 max-w-32 bg-gray-700 rounded-full h-2 ml-3">
                      <div 
                        className="bg-violet-500 h-2 rounded-full transition-all"
                        style={{ width: `${userProfile.level.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{userProfile.level.progress}%</span>
                  </div>
                </div>
              </div>

              {/* 통계 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-violet-400 mb-2">
                    {userProfile.totalMoviesWatched}
                  </div>
                  <div className="text-gray-400">총 시청 영화</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className={`text-3xl font-bold mb-2 ${getLevelColor(userProfile.averageRating)}`}>
                    {userProfile.averageRating.toFixed(1)}★
                  </div>
                  <div className="text-gray-400">평균 평점</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {Math.floor(watchedMovies.reduce((acc, movie) => acc + movie.runtime, 0) / 60)}h
                  </div>
                  <div className="text-gray-400">총 시청 시간</div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">최근 시청한 영화</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchedMovies.slice(0, 5).map(movie => (
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
                    <h4 className="font-medium text-sm truncate">{movie.title}</h4>
                    <p className="text-xs text-gray-400">{movie.watchedDate.toLocaleDateString()}</p>
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
                { id: "watched", label: "시청완료", count: watchedMovies.length },
                { id: "wishlist", label: "찜한영화", count: watchedMovies.filter(m => m.isFavorite).length },
                { id: "rewatch", label: "재시청", count: watchedMovies.filter(m => m.rewatch).length }
              ].map(filter => (
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
              {filteredMovies.map(movie => (
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
                          ❤️
                        </div>
                      )}
                      {movie.rewatch && (
                        <div className="bg-blue-500 bg-opacity-80 px-1 py-1 rounded text-xs">
                          🔄
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm truncate mb-1">{movie.title}</h4>
                  <p className="text-xs text-gray-400">{movie.watchedDate.toLocaleDateString()}</p>
                  <div className="flex gap-1 mt-1">
                    {movie.genre.slice(0, 2).map(g => (
                      <span key={g} className="text-xs bg-gray-700 px-2 py-1 rounded">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-violet-400 mb-2">
                  {watchedMovies.filter(m => m.review).length}
                </div>
                <div className="text-gray-400">작성한 리뷰</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-3xl font-bold text-red-400 mb-2">342</div>
                <div className="text-gray-400">받은 좋아요</div>
              </div>
            </div>

            <div className="space-y-4">
              {watchedMovies.filter(movie => movie.review).map(movie => (
                <div key={movie.id} className="bg-gray-900 rounded-xl p-6 border border-gray-700">
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
                        <h4 className="font-semibold text-lg">{movie.title}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < movie.userRating ? "text-yellow-400" : "text-gray-600"
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
                      <p className="text-gray-300 leading-relaxed">{movie.review}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <button className="flex items-center gap-1 hover:text-red-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          24
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
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

        {/* 취향 분석 */}
        {activeTab === "taste" && (
          <div className="space-y-8">
            {/* AI 취향 프로필 */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">취향 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎭</span>
                        <span className="font-semibold">감정 몰입형</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        깊이 있는 스토리와 캐릭터의 감정 변화를 중요하게 생각하는 타입입니다.
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🧩</span>
                        <span className="font-semibold">복잡한 서사 선호</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        단순한 플롯보다는 복잡하고 생각할 거리가 많은 영화를 선호합니다.
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎨</span>
                        <span className="font-semibold">영상미 중시</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        시각적 아름다움과 연출의 완성도를 높이 평가하는 경향이 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>높은 평점 (8.5+)</span>
                      <span className="text-violet-400 font-semibold">89%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>복잡한 서사구조</span>
                      <span className="text-blue-400 font-semibold">76%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>강한 감정적 임팩트</span>
                      <span className="text-green-400 font-semibold">71%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>사회적 메시지</span>
                      <span className="text-yellow-400 font-semibold">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 취향 변화 그래프 */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">취향 변화 추이</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">평점 기준 변화</h4>
                  <div className="space-y-3">
                    {[
                      { period: "가입 초기", rating: 3.8, color: "bg-red-500" },
                      { period: "3개월 후", rating: 4.1, color: "bg-yellow-500" },
                      { period: "6개월 후", rating: 4.3, color: "bg-green-500" },
                      { period: "현재", rating: 4.2, color: "bg-blue-500" }
                    ].map(data => (
                      <div key={data.period} className="flex items-center gap-4">
                        <span className="w-16 text-sm">{data.period}</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${data.color} h-2 rounded-full`}
                            style={{ width: `${(data.rating / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{data.rating}★</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">장르 선호도 변화</h4>
                  <div className="text-sm text-gray-400">
                    <p className="mb-2">📈 증가: SF, 스릴러, 다큐멘터리</p>
                    <p className="mb-2">📉 감소: 액션, 코미디</p>
                    <p>➡️ 유지: 드라마, 로맨스</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 시청 캘린더 */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">📅 시청 캘린더</h3>
              <div className="h-96 bg-white rounded-lg p-4">
                <Calendar<MovieEvent>
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  eventPropGetter={() => ({
                    style: {
                      backgroundColor: "#8B5CF6",
                      borderRadius: "4px",
                      opacity: 0.8,
                      color: "white",
                      border: "0px",
                      display: "block"
                    }
                  })}
                  components={{
                    event: ({ event }: { event: MovieEvent }) => (
                      <div className="text-xs p-1">
                        <div className="font-semibold truncate">{event.title}</div>
                        <div>⭐ {event.movie.userRating}</div>
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            {/* 월별 시청 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h4 className="font-semibold mb-3">이번 달 시청</h4>
                <div className="text-2xl font-bold text-violet-400">
                  {watchedMovies.filter(m => m.watchedDate.getMonth() === new Date().getMonth()).length}편
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h4 className="font-semibold mb-3">이번 달 평균 평점</h4>
                <div className="text-2xl font-bold text-yellow-400">
                  {(watchedMovies
                    .filter(m => m.watchedDate.getMonth() === new Date().getMonth())
                    .reduce((acc, m) => acc + m.userRating, 0) / 
                    watchedMovies.filter(m => m.watchedDate.getMonth() === new Date().getMonth()).length || 0
                  ).toFixed(1)}★
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h4 className="font-semibold mb-3">최다 시청 장르</h4>
                <div className="text-2xl font-bold text-green-400">드라마</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
