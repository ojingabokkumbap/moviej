import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUpcomingTMDB, fetchMovieLogo } from "@/hooks/useMoviesTMDB";
import { useRouter } from "next/navigation";

export default function UpcomingMovies() {
  const router = useRouter();
  const { upcomingMovies } = useUpcomingTMDB();
  const [logoMap, setLogoMap] = useState<{ [id: number]: string }>({});
  const [startIdx, setStartIdx] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    async function fetchLogos() {
      if (!upcomingMovies || upcomingMovies.length === 0) {
        setLogoMap({});
        return;
      }
      const entries = await Promise.all(
        upcomingMovies.map(async (movie) => {
          const url = await fetchMovieLogo(movie.id);
          return [movie.id, url || ""];
        })
      );
      const map: { [id: number]: string } = {};
      entries.forEach(([id, url]) => {
        map[id] = url;
      });
      setLogoMap(map);
    }
    fetchLogos();
  }, [upcomingMovies]);

  const sortedMovies = upcomingMovies.filter((movie) => {
    const today = new Date();
    const release = new Date(movie.release_date);
    const diff = Math.ceil(
      (release.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 100 && diff > 0;
  });
  const movieCount = sortedMovies.length;

  // idx 3개씩 움직이게 순환
  const getRotatedMovies = () => {
    if (movieCount === 0) return [];
    return [
      ...sortedMovies.slice(startIdx),
      ...sortedMovies.slice(0, startIdx),
    ];
  };

  const handlePrev = () => {
    setStartIdx((prev) => (prev - itemsPerPage + movieCount) % movieCount);
  };

  const handleNext = () => {
    setStartIdx((prev) => (prev + itemsPerPage) % movieCount);
  };

  const rotatedMovies = getRotatedMovies();

  const handleDetailClick = () => {
    const currentMovie = rotatedMovies[startIdx ?? 0];
    if (currentMovie) {
      router.push(`/movie/${currentMovie.id}`);
    }
  };

  return (
    <div className="w-full relative">
      <div className="w-full flex items-center mb-4 gap-4 absolute z-20 top-1/2 -translate-y-1/2 opacity-50">
        <button onClick={handlePrev} className="absolute">
          <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
            <polyline
              points="20,8 12,16 20,24"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            ></polyline>
          </svg>
        </button>
        <button onClick={handleNext} className="px-3 py-1 right-14 absolute">
          <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
            <polyline
              points="12,8 20,16 12,24"
              stroke="#ffffff"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            ></polyline>
          </svg>
        </button>
      </div>
      <div
        className="gap-5 w-fit h-[170px] grid overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${rotatedMovies.length}, minmax(285px , 1fr))`,
        }}
      >
        {rotatedMovies.map((movie) => {
          const today = new Date();
          const release = new Date(movie.release_date);
          const diff = Math.ceil(
            (release.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          const ddayText = `D-${diff}`;
          const logo = logoMap[movie.id];

          return (
            <div
              key={movie.id}
              className="w-full max-w-[285px] h-[170px] relative group cursor-pointer"
            >
              <Image
                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                alt={movie.title}
                fill
                sizes="285px"
                className="object-cover rounded-lg mb-2 transition-transform duration-300 group-hover:scale-105 bg-cover"
                style={{
                  borderRadius: "0.5rem",
                  zIndex: 1,
                }}
              />

              {/* 호버시 나타나는 영화 정보 */}
              <div className="absolute left-[-7px] min-w-[299px] max-w-[299px] h-[45px] bottom-0 bg-black bg-opacity-90 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-center items-center text-white z-20">
                <div className="flex justify-between w-full px-3">
                  <div>
                  <h3 className="text-base font-bold">{movie.title}</h3>
                  </div>
                  <button
                    onClick={handleDetailClick}
                    className=""
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 영화 로고 */}
              {logo && (
                <Image
                  src={logo}
                  alt={`${movie.title} logo`}
                  width={128}
                  height={90}
                  className="absolute left-3/4 bottom-0 object-contain -translate-x-1/2 -translate-y-1/2 z-10 flex items-center group-hover:opacity-30 transition-opacity duration-300"
                  style={{
                    pointerEvents: "none",
                    minWidth: "100px",
                    maxHeight: "90px",
                  }}
                />
              )}
              {/* D-Day 표시 */}
              <div className="absolute top-0 left-0 bg-violet-500 text-white px-3 py-1 rounded-tl rounded-br text-xs font-bold z-20 group-hover:opacity-0 transition-opacity duration-300">
                {ddayText}
              </div>
            </div>
          );
        })}
        <div className="absolute right-0 z-10 w-32 h-full bg-gradient-to-l from-black to-transparent"></div>
      </div>
    </div>
  );
}
