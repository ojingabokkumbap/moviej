"use client";
import { useState } from "react";

const genres = [
  { id: "action", name: "액션" },
  { id: "comedy", name: "코미디" },
  { id: "drama", name: "드라마" },
  { id: "romance", name: "로맨스" },
  { id: "horror", name: "공포" },
  { id: "scifi", name: "SF" },
  { id: "thriller", name: "스릴러" },
  { id: "animation", name: "애니메이션" },
  { id: "documentary", name: "다큐멘터리" },
  { id: "musical", name: "뮤지컬" },
  { id: "fantasy", name: "판타지" },
  { id: "crime", name: "범죄" },
];

interface Step1GenreProps {
  onNext: () => void;
  onDataUpdate: (data: any) => void;
  data: any;
}

export default function Step1Genre({
  onNext,
  onDataUpdate,
  data,
}: Step1GenreProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    data.genres || []
  );

  const handleGenreToggle = (genreId: string) => {
    const updated = selectedGenres.includes(genreId)
      ? selectedGenres.filter((g) => g !== genreId)
      : [...selectedGenres, genreId];
    setSelectedGenres(updated);
    onDataUpdate({ genres: updated });
  };

  const canProceed = selectedGenres.length >= 3;

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">선호하는 장르를 선택해주세요</h2>
      <p className="mb-8 text-gray-300">
        3개 이상 선택해주시면 더 정확한 추천이 가능해요!
        <span className="font-medium">({selectedGenres.length}/3)</span>
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreToggle(genre.id)}
            className={`
              px-4 py-6 tracking-wider text-xl rounded-lg border transition-all duration-200 hover:scale-105
              ${
                selectedGenres.includes(genre.id)
                  ? "border-violet-400 text-violet-400 font-bold"
                  : "border-gray-400 text-gray-400"
              }
            `}
          >
            <div className="flex items-center justify-between px-4">
              <p>{genre.name}</p>
              <svg width="25" height="25" viewBox="0 0 12 12" fill="none">
                <circle
                  cx="6"
                  cy="6"
                  r="6"
                  fill={
                    selectedGenres.includes(genre.id) ? "#5b21b6" : "#9ca3af"
                  }
                />
                <path
                  d="M4 6.5L6 8.5L8 4.5"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
      <div className="text-center">
        {selectedGenres.length < 3 && (
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
            장르를 3개 이상 선택해주세요.
          </span>
        )}
      </div>
      <div className="flex justify-end items-center">
        {canProceed && (
          <button onClick={onNext} className="text-lg flex items-center ">
            다음 단계
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
              class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 6l6 6l-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
