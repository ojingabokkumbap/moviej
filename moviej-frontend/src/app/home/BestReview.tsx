import React, { useState } from "react";
import Link from "next/link";

const images = [
  "https://image.tmdb.org/t/p/w500/y0rkgMCPGx3NUtkFp2DPEXcNv1F.jpg",
  "https://image.tmdb.org/t/p/w500/1oG69MtmZGovhho0pPgRY9d1qrU.jpg",
  "https://image.tmdb.org/t/p/w500/bvVoP1t2gNvmE9ccSrqR1zcGHGM.jpg",
  "https://image.tmdb.org/t/p/w500/wjh29GaJPKF1J0nLdpXuExncQ8U.jpg",
  "https://image.tmdb.org/t/p/w500/rkSlygPGFwYuu2Ci0x3LmAePJhk.jpg",
];

const reviews = [
  {
    genre: "#드라마",
    title: "애프터썬",
    desc: "아빠와 20여 년 전 갔던 튀르키예 여행. 둘만의 기억이 담긴 오래된 캠코더를 꺼내자 그해 여름이 물결처럼 출렁이기 시작한다.",
    rating: " 9.2",
  },
  {
    genre: "#액션",
    title: "액션영화",
    desc: "짜릿한 액션과 스릴 넘치는 전개가 돋보이는 영화.",
    rating: " 8.5",
  },
  {
    genre: "#코미디",
    title: "코미디영화",
    desc: "웃음이 끊이지 않는 유쾌한 코미디!",
    rating: " 8.0",
  },
  {
    genre: "#로맨스",
    title: "로맨스영화",
    desc: "감동적인 사랑 이야기가 펼쳐지는 영화.",
    rating: " 9.0",
  },
  {
    genre: "#공포",
    title: "공포영화",
    desc: "소름 돋는 공포와 긴장감이 가득한 영화.",
    rating: " 7.8",
  },
];

export default function BestReview() {
  const [startIdx, setStartIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const itemsPerPage = 5;
  const imgCount = images.length;

  // 순환 캐러셀
  const getVisibleIndexes = () => {
    const arr = [];
    for (let i = 0; i < itemsPerPage; i++) {
      arr.push((startIdx + i) % imgCount);
    }
    return arr;
  };

  const visibleIndexes = getVisibleIndexes();

  return (
    <div className="flex w-full mt-5 h-[430px]">
      <div className="flex-col justify-start w-2/6 py-20 pr-10">
        <div className="h-4/5">
          <p>{reviews[selectedIdx].genre}</p>
          <p className="font-semibold text-4xl">{reviews[selectedIdx].title}</p>
          <p className="text-gray-300 mt-5 h-24 items-start flex w-5/6">
            {reviews[selectedIdx].desc}
          </p>
          <p className="flex gap-2 mb-2 items-center">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"></path>
            </svg>
            {reviews[selectedIdx].rating}
          </p>
          <div className="flex gap-2 items-center ">
            <div className="rounded-full bg-gray-600 p-0.5 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c0-3.313 3.134-6 8-6s8 2.687 8 6"></path>
              </svg>
            </div>
            오징어볶음
          </div>
        </div>
        <div className="flex gap-4 w-full mt-14">
          <button className="border border-gray-300 px-4 py-2 w-1/3">
            공감해요
          </button>
          <button className="bg-violet-600 text-white px-4 py-2 w-1/3 ">
            상세보기
          </button>
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center relative">
        <div className="flex gap-6 w-full justify-start items-center">
          <div className="absolute top-0 right-24 z-10">
            <Link href="/reviews">
              <button className="border border-gray-400 pl-5 pr-3 py-1.5 rounded-full text-sm flex items-center justify-center hover:bg-gray-800 transition-colors">
                더보기
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <polyline
                    points="12,8 20,16 12,24"
                    stroke="#ffffff"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  ></polyline>
                </svg>
              </button>
            </Link>
          </div>
          {visibleIndexes.map((idx, i) => (
            <img
              key={idx}
              src={images[idx]}
              alt={`${idx + 1}`}
              className={`object-cover shadow-lg cursor-pointer transition-all 
                  ${
                    selectedIdx === idx
                      ? "border-violet-600"
                      : "border-transparent"
                  }
                  ${
                    i === 0
                      ? "h-[20vw] w-[14vw] max-h-[420px] max-w-[320px] min-h-[300px] min-w-[200px]"
                      : "h-[17vw] w-[12.4vw] max-h-[420px] max-w-[320px] min-h-[300px] min-w-[200px]"
                  }
      rounded-lg
                `}
              onClick={() => {
                setStartIdx(idx);
                setSelectedIdx(idx);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
