"use client";

import { useState, useEffect } from "react";
import { useMoviesTMDB } from "@/hooks/useMoviesTMDB";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useNotification } from "@/contexts/NotificationContext";
import { checkWishlist, toggleWishlist } from "@/lib/wishlistAPI";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getCarouselIndices(center: number, length: number) {
  // 5개를 항상 보여줌, 무한루프
  return [
    (center + length - 2) % length,
    (center + length - 1) % length,
    center % length,
    (center + 1) % length,
    (center + 2) % length,
  ];
}

// TMDB에서 실제 연령등급 정보를 가져오는 함수
async function fetchMovieRating(movieId: number): Promise<string> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/release_dates?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();

    // 한국(KR) 등급 정보 찾기
    const koreaRelease = data.results?.find((r: any) => r.iso_3166_1 === "KR");
    if (koreaRelease && koreaRelease.release_dates?.length > 0) {
      const certification = koreaRelease.release_dates[0].certification;

      // 한국 등급을 표준 형태로 변환
      if (certification.includes("전체")) return "전체";
      if (certification.includes("12세")) return "12+";
      if (certification.includes("15세")) return "15+";
      if (
        certification.includes("청소년관람불가") ||
        certification.includes("19세")
      )
        return "19+";
      if (certification.includes("제한상영가")) return "19+";
    }

    // 한국 정보가 없으면 미국(US) 등급 정보로 대체
    const usRelease = data.results?.find((r: any) => r.iso_3166_1 === "US");
    if (usRelease && usRelease.release_dates?.length > 0) {
      const certification = usRelease.release_dates[0].certification;

      // 미국 등급을 한국 등급으로 변환
      switch (certification) {
        case "G":
          return "전체";
        case "PG":
          return "12+";
        case "PG-13":
          return "15+";
        case "R":
          return "19+";
        case "NC-17":
          return "19+";
        default:
          return "12+";
      }
    }

    return "12+"; // 기본값
  } catch (error) {
    console.error(`Failed to fetch rating for movie ${movieId}:`, error);
    return "12+"; // 에러 시 기본값
  }
}

// 연령등급 추정 함수 (fallback용)
function getEstimatedRating(movie: any): string {
  // adult 필드가 true면 19세 이상
  if (movie.adult === true) {
    return "19+";
  }

  // 장르 기반 추정
  const genreIds = movie.genre_ids || [];

  // 호러, 스릴러 장르가 있고 평점이 높으면 15세 이상
  if (
    (genreIds.includes(27) || genreIds.includes(53)) &&
    movie.vote_average >= 7
  ) {
    return "15+";
  }

  // 액션, 범죄 장르가 있으면 12세 이상
  if (genreIds.includes(28) || genreIds.includes(80)) {
    return "12+";
  }

  // 가족, 애니메이션 장르면 전체관람가
  if (genreIds.includes(10751) || genreIds.includes(16)) {
    return "전체";
  }

  // 기본값은 12세 이상
  return "12+";
}

function getDisplayRating(
  movie: any,
  actualRatings: { [key: number]: string }
): string {
  return actualRatings[movie.id] || getEstimatedRating(movie);
}

// 연령등급별 색상 반환
function getRatingColor(rating: string): string {
  switch (rating) {
    case "전체":
      return "bg-green-700";
    case "12+":
      return "bg-sky-600";
    case "15+":
      return "bg-teal-700";
    case "19+":
      return "bg-red-700";
    default:
      return "bg-gray-700";
  }
}

// 상영시간 가져오는 함수
async function fetchMovieRuntime(movieId: number): Promise<number | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR`
    );
    const data = await response.json();
    return data.runtime ?? null; // 분 단위
  } catch (error) {
    console.error("Failed to fetch runtime:", error);
    return null;
  }
}

export default function MoviesPage() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // 상영시간 캐시
  const [carouselRuntimes, setCarouselRuntimes] = useState<{
    [key: number]: number | null;
  }>({});

  // 무한스크롤용 상태 (그리드 전용)
  const [gridMovies, setGridMovies] = useState<any[]>([]);
  const [gridPage, setGridPage] = useState(1);
  const [gridLoading, setGridLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 실제 연령등급 캐시
  const [actualRatings, setActualRatings] = useState<{ [key: number]: string }>(
    {}
  );

  const [center, setCenter] = useState(2); // 0~4, 가운데는 2
  const { movies, logos, genreMap } = useMoviesTMDB(); // 캐러셀용

  const { showNotification } = useNotification();
  const [wishlistStatus, setWishlistStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [wishlistLoading, setWishlistLoading] = useState<{
    [key: number]: boolean;
  }>({});

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "영화 - MovieJ";
  }, []);

  // 그리드용 영화 데이터 fetch 함수
  const fetchGridMovies = async (genre: string, page: number) => {
    try {
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=ko-KR&sort_by=popularity.desc&page=${page}&include_adult=false&vote_count.gte=100`;
      if (genre !== "all") {
        url += `&with_genres=${genre}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      const results = data.results || [];

      // 첫 페이지의 처음 10개 영화에 대해서만 실제 연령등급 가져오기
      if (page === 1 && results.length > 0) {
        const topMovies = results.slice(0, 10);
        const ratingPromises = topMovies.map(async (movie: any) => {
          const rating = await fetchMovieRating(movie.id);
          return { id: movie.id, rating };
        });

        try {
          const ratings = await Promise.all(ratingPromises);
          const ratingsMap: { [key: number]: string } = {};
          ratings.forEach(({ id, rating }) => {
            ratingsMap[id] = rating;
          });
          setActualRatings((prev) => ({ ...prev, ...ratingsMap }));
        } catch (error) {
          console.error("Failed to fetch actual ratings:", error);
        }
      }

      return {
        results,
        totalPages: data.total_pages,
        hasMore: page < data.total_pages && results.length > 0,
      };
    } catch (error) {
      console.error("Failed to fetch grid movies:", error);
      return { results: [], totalPages: 0, hasMore: false };
    }
  };

  // 장르 변경 시 그리드 데이터 초기화 및 첫 페이지 로드
  useEffect(() => {
    // 그리드 데이터 초기화 및 첫 페이지 로드
    setGridMovies([]);
    setGridPage(1);
    setGridLoading(true);
    setHasMore(true);

    fetchGridMovies(selectedGenre, 1).then(
      ({ results, hasMore: newHasMore }) => {
        setGridMovies(results.slice(0, 10));
        setHasMore(newHasMore);
        setGridLoading(false);
      }
    );
  }, [selectedGenre]);

  // 더보기 버튼 클릭 시
  const loadMoreMovies = async () => {
    if (gridLoading || !hasMore) return;

    setGridLoading(true);
    const nextPage = gridPage + 1;

    const { results, hasMore: newHasMore } = await fetchGridMovies(
      selectedGenre,
      nextPage
    );

    setGridMovies((prev) => [...prev, ...results]);
    setGridPage(nextPage);
    setHasMore(newHasMore);
    setGridLoading(false);
  };

  const carouselMovies = movies.slice(0, 20);
  const carouselLogos = logos.slice(0, 20);
  const images = carouselMovies.map(
    (movie) => `https://image.tmdb.org/t/p/w342${movie.poster_path}`
  );
  const titles = carouselMovies.map((movie) => movie.title);
  const indices = getCarouselIndices(center, images.length);

  const moveLeft = () =>
    setCenter((prev) => (prev - 1 + images.length) % images.length);
  const moveRight = () => setCenter((prev) => (prev + 1) % images.length);

  const [carouselCasts, setCarouselCasts] = useState<{
    [key: number]: string[];
  }>({});

  useEffect(() => {
    const ids = carouselMovies.map((movie) => movie.id);

    // 런타임: 이미 가져온 영화는 제외
    const idsToFetchRuntime = ids.filter((id) => !(id in carouselRuntimes));
    // 캐스팅: 이미 가져온 영화는 제외
    const idsToFetchCast = ids.filter((id) => !(id in carouselCasts));

    // 런타임 가져오기
    if (idsToFetchRuntime.length > 0) {
      Promise.all(
        idsToFetchRuntime.map(async (id) => ({
          id,
          runtime: await fetchMovieRuntime(id),
        }))
      ).then((results) => {
        const newRuntimes: { [key: number]: number | null } = {};
        results.forEach(({ id, runtime }) => {
          newRuntimes[id] = runtime;
        });
        setCarouselRuntimes((prev) => ({ ...prev, ...newRuntimes }));
      });
    }

    // 캐스팅 가져오기
    if (idsToFetchCast.length > 0) {
      Promise.all(
        idsToFetchCast.map(async (id) => {
          try {
            const res = await fetch(
              `${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}&language=ko-KR`
            );
            const data = await res.json();
            const castNames = (data.cast || [])
              .slice(0, 3)
              .map((person: any) => person.name);
            return { id, castNames };
          } catch {
            return { id, castNames: [] };
          }
        })
      ).then((results) => {
        const newCasts: { [key: number]: string[] } = {};
        results.forEach(({ id, castNames }) => {
          newCasts[id] = castNames;
        });
        setCarouselCasts((prev) => ({ ...prev, ...newCasts }));
      });
    }

    // 찜 여부 확인 (이미 확인한 영화는 제외)
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail && ids.length > 0) {
      // 아직 확인하지 않은 영화만 필터링
      const idsToCheckWishlist = ids.filter((id) => !(id in wishlistStatus));

      if (idsToCheckWishlist.length > 0) {
        Promise.all(
          idsToCheckWishlist.map(async (id) => {
            try {
              const isWishlisted = await checkWishlist(userEmail, id);
              return { id, isWishlisted };
            } catch {
              return { id, isWishlisted: false };
            }
          })
        ).then((results) => {
          const newWishlistStatus: { [key: number]: boolean } = {};
          results.forEach(({ id, isWishlisted }) => {
            newWishlistStatus[id] = isWishlisted;
          });
          setWishlistStatus((prev) => ({ ...prev, ...newWishlistStatus }));
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselMovies]);

  // 장르 필터링
  const genres = [
    { name: "전체", id: "all" },
    { name: "액션", id: 28 },
    { name: "드라마", id: 18 },
    { name: "판타지", id: 14 },
    { name: "스릴러", id: 53 },
    { name: "SF", id: 878 },
    { name: "애니", id: 16 },
    { name: "호러", id: 27 },
    { name: "추리", id: 9648 },
  ];

  // 찜하기 토글 핸들러
  const handleWishlistToggle = async (movieId: number, movie: any) => {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      showNotification("로그인이 필요합니다.", "warning");
      return;
    }

    if (!movie) return;

    setWishlistLoading((prev) => ({ ...prev, [movieId]: true }));
    try {
      await toggleWishlist(userEmail, {
        movieId: movieId,
        title: movie.title,
        posterPath: movie.poster_path,
      });

      const isNowInWishlist = !wishlistStatus[movieId];
      setWishlistStatus((prev) => ({ ...prev, [movieId]: isNowInWishlist }));

      showNotification(
        isNowInWishlist
          ? "컬렉션에 추가되었습니다."
          : "컬렉션에서 제거되었습니다.",
        "success"
      );
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
      showNotification("컬렉션 처리에 실패했습니다.", "error");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [movieId]: false }));
    }
  };

  return (
    <main className="flex flex-col items-center justify-center mt-[10rem] w-full">
      <div className="flex items-center w-max mb-10">
        <button
          onClick={moveLeft}
          className="text-white px-2 py-1 rounded-full z-50"
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 32 32"
            fill="none"
            className="opacity-80"
          >
            <polyline
              points="20,8 12,16 20,24"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="relative flex items-center h-[510px] w-[450px] justify-center">
          {images.length > 0 &&
            indices.map((imgIdx, posIdx) => {
              const size =
                posIdx === 2
                  ? "w-[430px] h-[625px]"
                  : posIdx === 1 || posIdx === 3
                  ? "w-[310px] h-[510px]"
                  : "w-[280px] h-[450px]";
              const opacity =
                posIdx === 2
                  ? "opacity-100"
                  : posIdx === 1 || posIdx === 3
                  ? "opacity-85"
                  : "opacity-80";
              const z = 10 - Math.abs(2 - posIdx);

              // posIdx별로 translateX 값 다르게
              let translateX = 0;
              if (posIdx === 0) translateX = -650;
              else if (posIdx === 1) translateX = -450;
              else if (posIdx === 2) translateX = 0;
              else if (posIdx === 3) translateX = 450;
              else if (posIdx === 4) translateX = 650;

              let clipPath = undefined;

              if (posIdx === 0 || posIdx === 1) {
                // 오른쪽만 기울임 (왼쪽은 그대로)
                clipPath = "polygon(0px 26px, 100% 15%, 100% 85%, 0px 95%)";
              }
              if (posIdx === 3 || posIdx === 4) {
                // 왼쪽만 기울임 (오른쪽은 그대로)
                clipPath = "polygon(0px 15%, 100% 25px, 100% 94%, 0px 85%)";
              }

              return (
                <div
                  key={images[imgIdx] + imgIdx}
                  className={`absolute top-1/2 left-1/2 ${size} ${opacity} transition-all duration-300 ease-in-out ${
                    posIdx === 2 ? " group" : ""
                  }`}
                  style={{
                    zIndex: z,
                    transform: `translate(-50%, -50%) translateX(${translateX}px)`,
                    clipPath: clipPath,
                  }}
                >
                  <Image
                    src={images[imgIdx]}
                    alt={`carousel-${imgIdx}`}
                    width={420}
                    height={570}
                    priority={posIdx === 2}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`w-full h-full object-contain rounded-lg shadow-xl -mt-1  ${
                      posIdx === 2
                        ? " transition-transform duration-500 group-hover:scale-105 brightness-100"
                        : ""
                    }`}
                    style={{ display: "block" }}
                  />
                  {posIdx === 2 && (
                    <>
                      <div
                        className="absolute inset-0 rounded-sm pointer-events-none transition-transform duration-500 group-hover:scale-105"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0) 70%)",
                        }}
                      />
                      <Image
                        src={carouselLogos[imgIdx]}
                        width={300}
                        height={100}
                        alt={titles[imgIdx]}
                        className="absolute flex min-h-28 items-center bottom-44 left-1/2 -translate-x-1/2 h-auto z-10 pointer-events-none max-h-32"
                        style={{ objectFit: "contain" }}
                      />
                      <div className="absolute bottom-10 left-20 text-left z-10 text-gray-200 text-sm w-[280px]">
                        {/* 연령등급 라벨 */}
                        <div className="flex items-center justify-start tracking-wider text-sm gap-2 opacity-90">
                          <div
                            className={`px-1.5 py-0.5 rounded text-white text-sm font-bold ${getRatingColor(
                              getDisplayRating(
                                carouselMovies[imgIdx],
                                actualRatings
                              )
                            )} `}
                          >
                            {getDisplayRating(
                              carouselMovies[imgIdx],
                              actualRatings
                            )}
                          </div>
                          <span className="py-0.5 text-sm font-light">
                            {carouselRuntimes[carouselMovies[imgIdx].id]
                              ? `${
                                  carouselRuntimes[carouselMovies[imgIdx].id]
                                }분`
                              : ""}
                          </span>
                          {carouselMovies[imgIdx]?.genre_ids?.length > 0 && (
                            <div className="font-light tracking-wider gap-1 flex text-sm ">
                              {carouselMovies[imgIdx].genre_ids
                                .slice(0, 3)
                                .filter(Boolean)
                                .map((id: number) => (
                                  <span key={id} className="font-light ">
                                    {genreMap[id]?.toUpperCase()}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-300 ">
                          {carouselCasts[carouselMovies[imgIdx].id]?.length >
                            0 && (
                            <span>
                              {carouselCasts[carouselMovies[imgIdx].id]
                                .slice(0, 3)
                                .join(", ")}{" "}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 w-full mt-3 text-base">
                          <button
                            className="bg-violet-700 border-violet-700 px-4 py-2.5 w-1/2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlistToggle(
                                carouselMovies[imgIdx].id,
                                carouselMovies[imgIdx]
                              );
                            }}
                            disabled={
                              wishlistLoading[carouselMovies[imgIdx].id]
                            }
                          >
                            {wishlistStatus[carouselMovies[imgIdx].id]
                              ? "컬렉션 제거"
                              : "컬렉션 추가"}
                          </button>
                          <button
                            className="border border-gray-300 px-4 py-2.5 w-1/2"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/movie/${carouselMovies[imgIdx].id}`
                              );
                            }}
                          >
                            상세정보
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
        <button
          onClick={moveRight}
          className="text-white px-2 py-1 rounded-full z-50"
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 32 32"
            fill="none"
            className="opacity-80"
          >
            <polyline
              points="12,8 20,16 12,24"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="max-w-7xl mx-auto mt-16">
        {/* 장르 필터 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-1">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id.toString())}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre.id.toString()
                    ? "bg-violet-600 text-white"
                    : "text-gray-300  hover:text-white"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* 영화 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {gridMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                  alt={movie.title}
                  width={342}
                  height={513}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* 연령등급 라벨 */}
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-white text-xs font-bold ${getRatingColor(
                    getDisplayRating(movie, actualRatings)
                  )} z-10`}
                >
                  {getDisplayRating(movie, actualRatings)}
                </div>

                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">
                      {movie.release_date?.slice(0, 4)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* 더보기 버튼 */}
        {hasMore && (
          <div className="text-center py-8 text-gray-300">
            <button
              onClick={loadMoreMovies}
              disabled={gridLoading}
              className="px-8 py-3"
            >
              더보기
              <svg
                className="w-4 h-4 inline-block ml-2 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
          </div>
        )}

        {/* 로딩 상태 */}
        {gridMovies.length === 0 && !gridLoading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              선택한 장르의 영화가 없습니다.
            </p>
          </div>
        )}

        {/* 초기 로딩 */}
        {gridMovies.length === 0 && gridLoading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              영화 데이터를 로딩 중입니다...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
