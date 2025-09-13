"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CirclePercentChart from "./../../home/CirclePercentChart";
import Tooltip from "@/components/Tooltip";
import {
  fetchMovieDetails as getMovieDetails,
  fetchDetailedMovieCredits,
  fetchSimilarMovies,
  fetchMovieVideos,
  fetchMovieImages,
  fetchMovieReviews,
} from "@/lib/tmdbAPI";

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  production_countries: { name: string }[];
  spoken_languages: { name: string }[];
  popularity: number;
}

interface MovieCredits {
  directors: {
    id: number;
    name: string;
    profile_path: string;
  }[];
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string;
  }[];
}

interface SimilarMovie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

interface MovieImage {
  file_path: string;
  width: number;
  height: number;
}

interface MovieReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string;
    rating: number;
  };
  content: string;
  created_at: string;
  updated_at: string;
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [videos, setVideos] = useState<MovieVideo[]>([]);
  const [images, setImages] = useState<{
    backdrops: MovieImage[];
    posters: MovieImage[];
  }>({ backdrops: [], posters: [] });
  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllSimilar, setShowAllSimilar] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [userComments, setUserComments] = useState<
    {
      id: string;
      author: string;
      content: string;
      createdAt: Date;
      rating: number;
      likes: number;
      isLiked: boolean;
    }[]
  >([]);
  const [activeTab, setActiveTab] = useState<"videos" | "images">("videos");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [modalRating, setModalRating] = useState(0);
  const [modalReview, setModalReview] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!movieId) return;

      try {
        setIsLoading(true);
        const [
          movieData,
          creditsData,
          similarData,
          videosData,
          imagesData,
          reviewsData,
        ] = await Promise.all([
          getMovieDetails(movieId),
          fetchDetailedMovieCredits(movieId),
          fetchSimilarMovies(movieId),
          fetchMovieVideos(movieId),
          fetchMovieImages(movieId),
          fetchMovieReviews(movieId),
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setSimilarMovies(similarData.slice(0, 10)); // 최대 10개만
        setVideos(videosData.slice(0, 10)); // 최대 10개만
        setImages({
          backdrops: imagesData.backdrops.slice(0, 10), // 최대 10개만
          posters: imagesData.posters.slice(0, 10),
        });
        setReviews(reviewsData);
      } catch (err) {
        setError("영화 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching movie details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [movieId]);

  const handleModalSubmit = () => {
    if (modalRating > 0) {
      const review = {
        id: Date.now().toString(),
        author: "현재 사용자",
        content: modalReview.trim() || "평점만 등록했습니다.",
        createdAt: new Date(),
        rating: modalRating,
        likes: 0,
        isLiked: false,
      };
      setUserComments([review, ...userComments]);
      setShowRatingModal(false);
      setModalRating(0);
      setModalReview("");
    }
  };

  // 좋아요 토글 함수
  const handleLikeToggle = (commentId: string) => {
    setUserComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          };
        }
        return comment;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {error || "영화를 찾을 수 없습니다."}
          </h1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  const directors = credits?.directors || [];
  const mainCast = credits?.cast.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 백드롭 이미지 - 배경으로만 사용 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.1) 0%,
            rgba(0,0,0,1) 100%
          ), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="relative z-10 w-full mt-[450px]">
        {/* 영화 정보 섹션 */}
        <div className="flex items-center">
          <div className="max-w-screen-xl mx-auto">
            {/* 영화 정보 */}
            <div className="flex ">
              {/* 포스터 */}
              <div className="flex flex-col">
                <div className="flex">
                  <div className="flex flex-col gap-3">
                    <div className="flex-shrink-0">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        width={230}
                        height={400}
                        className="shadow-2xl"
                      />
                    </div>
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="px-8 py-2 bg-violet-900 hover:bg-violet-700 transition-colors"
                    >
                      평가하기
                    </button>
                    <button className="px-8 py-2 border border-gray-400 hover:bg-gray-50 hover:text-black transition-colors">
                      리스트 추가
                    </button>
                  </div>
                  {/* 영화 정보 */}
                  <div className="flex-1 pl-10">
                    <div className="flex items-center">
                      <h1 className="text-4xl font-medium pl-3">
                        {movie.title}
                      </h1>
                      {/* 장르 */}
                      <div className="">
                        {movie.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="inline-block border border-gray-300 px-3 py-0.5 text-xs ml-3"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* 기본 정보 */}
                    <div className="flex items-center gap-6 my-4 shadow-[0_0.5px_0_0_#d4d4d8,0_-0.5px_0_0_#d4d4d8] py-6 font-light">
                      <div className="flex items-center gap-3 pl-3">
                        <div className="flex gap-1">
                          <div className="">
                            <span className="ml-2 text-gray-200 flex gap-3 items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M12 4c4.29 0 7.863 2.429 10.665 7.154l.22 .379l.045 .1l.03 .083l.014 .055l.014 .082l.011 .1v.11l-.014 .111a.992 .992 0 0 1 -.026 .11l-.039 .108l-.036 .075l-.016 .03c-2.764 4.836 -6.3 7.38 -10.555 7.499l-.313 .004c-4.396 0 -8.037 -2.549 -10.868 -7.504a1 1 0 0 1 0 -.992c2.831 -4.955 6.472 -7.504 10.868 -7.504zm0 5a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" />
                              </svg>
                              <span className="text-white">
                                {Number(
                                  Math.round(movie.popularity * 1000)
                                ).toLocaleString()}
                              </span>
                            </span>
                          </div>
                          {/* 별점 */}
                          <div className="ml-5 text-white flex gap-1 items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(movie.vote_average / 2)
                                    ? "text-white-400"
                                    : "text-gray-400"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                              </svg>
                            ))}
                            <span className="ml-2">
                              {movie.vote_average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="flex">
                        <span className="text-gray-300 mr-2 font-medium">
                          개봉
                        </span>
                        {movie.release_date?.slice(0, 4)}
                      </span>
                      <span className="flex">
                        <span className="text-gray-300 mr-2 font-medium">
                          러닝타임
                        </span>
                        {movie.runtime}분
                      </span>
                      <span className="flex">
                        <span className="text-gray-300 mr-2 font-medium">
                          감독
                        </span>
                        {directors.map((d) => d.name).join(", ")}
                      </span>
                    </div>
                    {/* 줄거리 */}
                    <div className="flex shadow-[0_0.3px_0_0_#d4d4d8] min-h-[280px]">
                      <div className="w-9/12 pr-3">
                        <h2 className="text-xl mr-2 font-medium mb-3 pl-3 text-gray-200">
                          줄거리
                        </h2>
                        <div className="font-light leading-relaxed pl-3 min-h-[140px]">
                          {movie.overview || "줄거리 정보가 없습니다."}
                        </div>
                        <h2 className="text-xl mr-2 font-medium mt-3 mb-3 text-gray-200 pl-3">
                          출연진
                        </h2>
                        <div className="flex gap-6 mb-5 flex-wrap pl-3 min-w-[630px] max-w-[63s0px]">
                          {(showAllCast ? mainCast : mainCast.slice(0, 4)).map(
                            (actor) => (
                              <div key={actor.id} className="flex items-center">
                                <div className="relative w-9 h-9 mr-3">
                                  {actor.profile_path ? (
                                    <Image
                                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                      alt={actor.name}
                                      fill
                                      className="rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                      <span className="text-gray-400 text-xs">
                                        사진없음
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm flex flex-col">
                                  <span className="">{actor.name}</span>
                                  <span className="text-xs">
                                    {actor.character}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                          {mainCast.length > 4 && (
                            <button
                              onClick={() => setShowAllCast(!showAllCast)}
                              className="flex items-center text-gray-300 hover:text-white transition-colors mt-2 mb-1"
                            >
                              {showAllCast ? (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1"
                                    stroke="currentColor"
                                    className="size-5"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                  </svg>
                                  <span className="ml-1">접기</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1"
                                    stroke="currentColor"
                                    className="size-5"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                  </svg>
                                  <span className="ml-1">더보기</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 mb-4 mx-auto">
                        <div className="text-xl text-center font-medium mb-3 mt-1">
                          <div className="flex items-center justify-center gap-1 text-gray-100">
                            취향점수
                            <Tooltip content="당신의 취향 분석을 바탕으로 계산된 점수입니다">
                              <button className="hover:text-violet-400 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" />
                                </svg>
                              </button>
                            </Tooltip>
                          </div>
                          <div className="mt-14">
                            <CirclePercentChart
                              percent={75}
                              color="#864AF9"
                              size={130}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {/* 영화 영상/이미지 섹션 - 탭 */}
                  <div className="mt-16">
                    <div className="flex mb-8">
                      <h2 className="text-3xl font-medium mr-8">미디어</h2>
                    </div>
                    <div className="flex mb-10">
                      <button
                        onClick={() => setActiveTab("videos")}
                        className={`px-6 py-2 font-medium transition-colors ${
                          activeTab === "videos"
                            ? "text-violet-400 border-b-2 border-violet-400 font-semibold"
                            : "text-gray-200 hover:text-white font-normal"
                        }`}
                      >
                        영상 ({Math.min(videos.length, 10)})
                      </button>
                      <button
                        onClick={() => setActiveTab("images")}
                        className={`px-6 py-2 font-medium transition-colors ${
                          activeTab === "images"
                            ? "text-violet-400 border-b-2 border-violet-400 font-semibold"
                            : "text-gray-200 hover:text-white font-normal"
                        }`}
                      >
                        이미지 ({Math.min(images.backdrops.length, 10)})
                      </button>
                    </div>

                    {/* 영상 탭 */}
                    {activeTab === "videos" && (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {videos
                            .slice(0, showAllImages ? 10 : 4)
                            .map((video) => (
                              <div
                                key={video.id}
                                className="bg-indigo-950 rounded-lg overflow-hidden"
                              >
                                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                                  {video.site === "YouTube" ? (
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={`https://www.youtube.com/embed/${video.key}`}
                                      title={video.name}
                                      frameBorder="0"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <div className="text-gray-400">
                                      <svg
                                        className="w-12 h-12"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                          fillRule="evenodd"
                                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <h3 className="font-medium text-xs truncate">
                                    {video.name}
                                  </h3>
                                </div>
                              </div>
                            ))}
                        </div>
                        {videos.length > 5 && (
                          <div className="text-center mt-6">
                            <button
                              onClick={() => setShowAllImages(!showAllImages)}
                              className="px-6 py-2 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-colors rounded-lg"
                            >
                              {showAllImages ? "접기" : `더보기`}
                            </button>
                          </div>
                        )}
                        {videos.length === 0 && (
                          <p className="text-gray-200 text-center py-8">
                            등록된 영상이 없습니다.
                          </p>
                        )}
                      </div>
                    )}

                    {/* 이미지 탭 */}
                    {activeTab === "images" && (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {images.backdrops
                            .slice(0, showAllImages ? 10 : 4)
                            .map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                                  alt={`${movie?.title} 이미지 ${index + 1}`}
                                  fill
                                  className="object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ))}
                        </div>
                        {images.backdrops.length > 5 && (
                          <div className="text-center mt-6">
                            <button
                              onClick={() => setShowAllImages(!showAllImages)}
                              className="px-6 py-2 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-colors rounded-lg"
                            >
                              {showAllImages ? "접기" : `더 보기 `}
                            </button>
                          </div>
                        )}
                        {images.backdrops.length === 0 && (
                          <p className="text-gray-400 text-center py-8">
                            등록된 이미지가 없습니다.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 비슷한 영화 추천 섹션 */}
                  <div className="mt-16">
                    <h2 className="text-3xl font-medium mb-8">비슷한 영화</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {(showAllSimilar
                        ? similarMovies
                        : similarMovies.slice(0, 5)
                      ).map((movie) => (
                        <div
                          key={movie.id}
                          className="cursor-pointer group"
                          onClick={() => router.push(`/movie/${movie.id}`)}
                        >
                          <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden">
                            <Image
                              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                              alt={movie.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                              </svg>
                              {movie.vote_average.toFixed(1)}
                            </div>
                          </div>
                          <div className="font-medium text-sm group-hover:text-violet-400 transition-colors flex justify-between">
                            <p>{movie.title}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {movie.release_date?.slice(0, 4)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {similarMovies.length > 5 && (
                      <div className="text-center mt-8">
                        <button
                          onClick={() => setShowAllSimilar(!showAllSimilar)}
                          className="px-6 py-2 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-colors rounded-lg"
                        >
                          {showAllSimilar
                            ? "접기"
                            : `더보기`}
                        </button>
                      </div>
                    )}
                    {similarMovies.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        추천할 영화가 없습니다.
                      </p>
                    )}
                  </div>

                  {/* 코멘트 섹션  */}
                  <div className="my-16">
                    <h2 className="text-3xl font-medium mb-8">인기 감상평</h2>
                    <div className="flex gap-5">
                      {userComments.slice(0, 4).map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-900 bg-opacity-80 border border-gray-700 rounded-lg w-1/4"
                        >
                          {/* 헤더 - 프로필 정보 */}
                          <div className="flex items-center justify-between px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-gray-200 font-semibold text-sm">
                                  {comment.author.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-200 text-sm">
                                  {comment.author}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < comment.rating
                                          ? "text-yellow-300"
                                          : "text-gray-600"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                                    </svg>
                                  ))}
                                  <span className="text-xs text-gray-400 ml-1">
                                    {comment.rating}/5
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 컨텐츠 */}
                          <div className="px-8">
                            <p className="text-gray-200 leading-relaxed text-sm mb-4 min-h-[60px]">
                              {comment.content}
                            </p>
                          </div>
                          <div className="px-8 pb-4">
                            <div className="flex items-center justify-end gap-2 mb-3">
                              <button
                                onClick={() => handleLikeToggle(comment.id)}
                                className={`transition-all duration-200 ${
                                  comment.isLiked
                                    ? "text-gray-200 hover:text-red-400"
                                    : "text-gray-400 hover:text-gray-300"
                                }`}
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    comment.isLiked ? "scale-110" : ""
                                  }`}
                                  fill={
                                    comment.isLiked ? "currentColor" : "none"
                                  }
                                  stroke="currentColor"
                                  strokeWidth="1"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                              {/* 좋아요 수 */}
                              <div className="text-sm text-gray-300">
                                공감 {comment.likes}개
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 후기 더보기 버튼 */}
                    {userComments.length > 0 && (
                      <div className="text-center mt-8">
                        <Link 
                          href={`/reviews?movieId=${movieId}&movieTitle=${encodeURIComponent(movie?.title || '')}`}
                        >
                          <button className="px-8 py-3 border border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white transition-colors rounded-lg font-medium">
                            이 영화의 후기 더보기
                          </button>
                        </Link>
                      </div>
                    )}
                    
                    {userComments.length === 0 && reviews.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        아직 코멘트가 없습니다. 첫 번째 코멘트를 남겨보세요!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 평가 모달 */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
            onClick={() => setShowRatingModal(false)}
          />
          {/* 모달 컨텐츠 */}
          <div className="relative bg-gray-900 rounded-xl border border-gray-600 w-[650px]">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-2xl font-bold text-white">평가</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* 영화 정보 */}
            <div className="px-16 pb-16">
              <div className="my-4">
                <p className="text-2xl font-medium text-white text-center">
                  {movie.title}에 대해 평가해주세요.
                </p>
              </div>
              {/* 별점 선택 */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setModalRating(star)}
                      className="text-4xl transition-colors hover:scale-110 transform"
                    >
                      <svg
                        className={`w-16 h-16 ${
                          star <= modalRating
                            ? "text-violet-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {modalRating > 0 && (
                  <p className="text-center text-violet-400 mt-2 font-medium">
                    {modalRating}점 선택됨
                  </p>
                )}
              </div>

              {/* 후기 작성 */}
              <div className="mb-6">
                <textarea
                  value={modalReview}
                  onChange={(e) => setModalReview(e.target.value)}
                  placeholder="영화에 대한 후기를 작성해주세요. (선택)"
                  className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-violet-500"
                  maxLength={50}
                />
                <p className="text-gray-400 text-xs mt-1 text-right">
                  {modalReview.length}/50
                </p>
              </div>

              {/* 버튼들 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleModalSubmit}
                  disabled={modalRating === 0}
                  className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
