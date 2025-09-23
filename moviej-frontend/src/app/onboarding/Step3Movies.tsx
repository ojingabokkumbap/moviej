"use client";
import { useState, useEffect } from "react";

interface Movie {
  id: string;
  title: string;
  year: string;
  backdropPath: string | null;
  posterPath: string | null;
}

const DOMESTIC_MOVIES = [
  "명량",
  "극한직업",
  "신과함께: 죄와 벌",
  "국제시장",
  "베테랑",
  "서울의 봄",
  "괴물",
  "쉬리",
  "7번방의 선물",
  "암살",
  "살인의 추억",
  "광해, 왕이 된 남자",
  "왕의 남자",
  "택시운전사",
  "태극기 휘날리며",
  "부산행",
  "해운대",
  "변호인",
  "실미도",
  "암살",
  "기생충",
  "검사외전",
  "파묘",
  "범죄도시",
];

const INTERNATIONAL_MOVIES = [
  "Avengers: Endgame",
  "글래디에이터",
  "Avatar",
  "인사이드 아웃",
  "Avengers: Infinity War",
  "어바웃 타임",
  "Avengers: Age of Ultron",
  "Interstellar",
  "Frozen",
  "Bohemian Rhapsody",
  "쇼생크 탈출",
  "대부",
  "센과 치히로의 행방불명",
  "너의 이름은",
  "반지의 제왕",
  "스파이더 맨",
  "양들의 침묵",
  "터미네이터",
  "월-E",
  "이터널 선샤인",
  "드래곤 길들이기",
  "해리 포터",
  "토이 스토리",
  "쥬라기 공원",
];

// TMDB에서 영화 정보를 검색하는 함수
async function searchMovieOnTMDB(movieTitle: string): Promise<Movie> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      console.warn("TMDB API key not found");
      return {
        id: `local_${movieTitle}`,
        title: movieTitle,
        year: "2024",
        backdropPath: null,
        posterPath: null,
      };
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(
        movieTitle
      )}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      return {
        id: movie.id.toString(),
        title: movie.title || movieTitle,
        year: movie.release_date ? movie.release_date.split("-")[0] : "2024",
        backdropPath: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
          : null,
        posterPath: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : null,
      };
    }

    return {
      id: `local_${movieTitle}`,
      title: movieTitle,
      year: "2024",
      backdropPath: null,
      posterPath: null,
    };
  } catch (error) {
    console.error(`Error searching for movie ${movieTitle}:`, error);
    return {
      id: `local_${movieTitle}`,
      title: movieTitle,
      year: "2024",
      backdropPath: null,
      posterPath: null,
    };
  }
}

interface Step3MoviesProps {
  onNext: () => void;
  onPrev: () => void;
  onDataUpdate: (data: any) => void;
  data: any;
}

export default function Step3Movies({
  onNext,
  onPrev,
  onDataUpdate,
  data,
}: Step3MoviesProps) {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>(
    data.movies || []
  );
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"domestic" | "international">(
    "domestic"
  );
  const [rating, setRating] = useState<{ [key: string]: number }>(
    data.movieRatings || {}
  );

  // 컴포넌트 마운트시 영화 정보 로드
  useEffect(() => {
    loadMovies();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMovies = async () => {
    setIsLoading(true);
    setError(null);
    setMovies([]);

    try {
      const movieList =
        activeTab === "domestic" ? DOMESTIC_MOVIES : INTERNATIONAL_MOVIES;

      // 영화를 청크 단위로 나누어 점진적으로 로드
      const chunkSize = 8;
      const chunks = [];
      for (let i = 0; i < movieList.length; i += chunkSize) {
        chunks.push(movieList.slice(i, i + chunkSize));
      }

      const allMovies: Movie[] = [];

      for (const chunk of chunks) {
        const chunkPromises = chunk.map((title) => searchMovieOnTMDB(title));
        const chunkResults = await Promise.all(chunkPromises);
        allMovies.push(...chunkResults);

        setMovies([...allMovies]);

        if (allMovies.length < movieList.length) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    } catch (err) {
      setError("영화 정보를 불러오는데 실패했습니다.");
      console.error("Error loading movies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieToggle = (movie: Movie) => {
    const isSelected = selectedMovies.some((m) => m.id === movie.id);
    const updated = isSelected
      ? selectedMovies.filter((m) => m.id !== movie.id)
      : [...selectedMovies, movie];
    setSelectedMovies(updated);

    // 선택 해제 시 평점도 제거
    const newRating = { ...rating };
    if (!updated.some((m) => m.id === movie.id)) {
      delete newRating[movie.id];
      setRating(newRating);
    }

    onDataUpdate({
      movies: updated,
      movieRatings: newRating,
    });
  };

  const handleRating = (movieId: string, score: number) => {
    const newRating = { ...rating, [movieId]: score };
    setRating(newRating);
    onDataUpdate({
      movies: selectedMovies,
      movieRatings: newRating,
    });
  };

  const canProceed =
    selectedMovies.length >= 5 &&
    selectedMovies.every((movie) => rating[movie.id] && rating[movie.id] > 0);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">좋아하는 영화를 선택해주세요</h2>
      <p className="mb-8">
        최소 5편 이상 선택하고 평점도 매겨주세요!
        <span className="font-medium">({selectedMovies.length}/5)</span>
      </p>
      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="flex  p-1">
            <button
              onClick={() => setActiveTab("domestic")}
              className={`px-6 py-2 rounded-full transition-colors font-medium ${
                activeTab === "domestic"
                  ? "bg-violet-600 text-white shadow-sm font-bold"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              국내
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`px-6 py-2 rounded-full transition-colors font-medium ${
                activeTab === "international"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              해외
            </button>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {/* 영화 목록 */}
      {movies.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96o">
            {movies.map((movie, index) => {
              const isSelected = selectedMovies.some((m) => m.id === movie.id);
              return (
                <div
                  key={`${movie.id}_${index}`}
                  className={`relative rounded-lg overflow-hidden border transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "border-violet-500 shadow-lg"
                      : "border-gray-400 hover:border-violet-300"
                  }`}
                  style={{
                    backgroundImage: movie.backdropPath
                      ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${movie.backdropPath})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "200px",
                  }}
                >
                  <button
                    onClick={() => handleMovieToggle(movie)}
                    className="w-full h-full p-4 text-white text-left relative"
                  >
                    {/* 선택 체크 아이콘 */}
                    <div className="absolute top-3 left-3">
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="6"
                          fill={isSelected ? "#5b21b6" : "#6b7280"}
                        />
                        <path
                          d="M4 6.5L6 8.5L8 4.5"
                          stroke="#fff"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col justify-end h-full text-right">
                      <div className="font-bold text-2xl">{movie.title}</div>
                      <div className="text-sm opacity-90">{movie.year}</div>
                    </div>
                  </button>

                  {/* 평점 선택 (선택된 영화만) */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 p-4">
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRating(movie.id, star);
                            }}
                            className={`text-xl transition-colors ${
                              (rating[movie.id] || 0) >= star
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="icon icon-tabler icons-tabler-filled icon-tabler-star"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <p className="text-white text-xs mt-1 text-center">
                        {rating[movie.id]
                          ? `${rating[movie.id]}점`
                          : "별점을 선택해주세요"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 영화 로드 실패시 */}
      {!isLoading && movies.length === 0 && (
        <div className="mb-8 text-center text-gray-500">
          영화 정보를 불러올 수 없습니다. 새로고침을 시도해주세요.
        </div>
      )}

      {/* 선택된 영화 목록 */}
      {selectedMovies.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedMovies.map((movie) => (
              <div
                key={movie.id}
                className="px-3 py-1 rounded-sm text-base font-light flex items-center gap-1 border-violet-500 border"
              >
                <button
                  onClick={() => handleMovieToggle(movie)}
                  className="text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    class="icon icon-tabler icons-tabler-outline icon-tabler-x"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
                <span>{movie.title}</span>
                {rating[movie.id] && (
                  <span className="ml-1 text-yellow-400 flex gap-1 items-center ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="icon icon-tabler icons-tabler-filled icon-tabler-star"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                    </svg>
                    {rating[movie.id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={onPrev}
          className="text-lg flex items-center justify-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 6l-6 6l6 6" />
          </svg>
          이전 단계
        </button>

        <div className="text-sm">
          {selectedMovies.length < 5 && (
            <span className="text-purple-400 text-lg flex items-center justify-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="icon icon-tabler icons-tabler-filled icon-tabler-alert-circle"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
              </svg>
              영화를 5편 이상 선택해주세요.
            </span>
          )}
          {selectedMovies.length >= 5 &&
            selectedMovies.some((movie) => !rating[movie.id]) && (
              <span className="text-purple-400 text-lg flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="icon icon-tabler icons-tabler-filled icon-tabler-alert-circle"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
                </svg>
                영화의 별점을 선택해주세요.
              </span>
            )}
        </div>

        {canProceed && (
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-lg font-medium transition-all bg-violet-600 text-white hover:bg-violet-700 shadow-lg"
          >
            완료하기
          </button>
        )}
      </div>
    </div>
  );
}
