"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// 임시 뉴스 데이터 (실제로는 API에서 가져올 예정)
const mockNews = [
  {
    id: 1,
    title: "2025년 최고 기대작, 아바타 3 공개",
    summary:
      "제임스 카메론 감독의 아바타 시리즈 3편이 드디어 공개됩니다. 판도라의 새로운 모험이 시작됩니다.",
    content:
      "제임스 카메론 감독의 아바타 시리즈 3편이 2025년 12월 개봉 예정입니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    category: "개봉 소식",
    author: "영화 매거진",
    publishedAt: "2025-01-15",
    views: 15420,
    featured: true,
  },
  {
    id: 2,
    title: "AI 기술로 제작된 첫 번째 장편 영화",
    summary:
      "인공지능 기술을 활용해 제작된 첫 번째 장편 영화가 선댄스 영화제에서 공개됩니다.",
    content:
      "혁신적인 AI 기술을 활용해 제작된 장편 영화가 영화계에 큰 화제를 모으고 있습니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
    category: "기술",
    author: "테크 시네마",
    publishedAt: "2025-01-12",
    views: 23890,
    featured: true,
  },
  {
    id: 3,
    title: "디즈니, 픽사 신작 라인업 발표",
    summary:
      "디즈니가 2025년 픽사 애니메이션 신작들을 공개했습니다. 토이 스토리 5와 인크레더블 3가 포함되어 있습니다.",
    content: "디즈니가 D23 엑스포에서 픽사의 새로운 작품들을 발표했습니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/aKbulUG3weFzipR0xsQ3z7aDXLv.jpg",
    category: "개봉 소식",
    author: "애니메이션 뉴스",
    publishedAt: "2025-01-10",
    views: 18750,
    featured: false,
  },
  {
    id: 4,
    title: "2024년 최고 수익 영화 톱 10",
    summary:
      "2024년 한 해 동안 전 세계에서 가장 많은 수익을 올린 영화들을 정리했습니다.",
    content: "2024년 박스오피스를 장악한 영화들을 분석해보겠습니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    category: "박스오피스",
    author: "박스오피스 전문가",
    publishedAt: "2025-01-08",
    views: 12340,
    featured: false,
  },
  {
    id: 5,
    title: "VR 영화관의 미래",
    summary:
      "가상현실 기술을 활용한 새로운 영화 관람 방식이 주목받고 있습니다. 집에서도 IMAX 급 경험이 가능합니다.",
    content: "VR 기술의 발전으로 영화 관람의 패러다임이 변화하고 있습니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    category: "기술",
    author: "VR 시네마",
    publishedAt: "2025-01-05",
    views: 9876,
    featured: false,
  },
  {
    id: 6,
    title: "슈퍼히어로 영화의 새로운 트렌드",
    summary:
      "2025년 슈퍼히어로 영화들이 보여주는 새로운 트렌드와 변화를 분석해봅니다.",
    content: "슈퍼히어로 영화 장르의 새로운 변화를 살펴봅니다...",
    thumbnail: "https://image.tmdb.org/t/p/w500/qAKvGA39dyy1H7hf0m4mTGvkzr.jpg",
    category: "개봉 소식",
    author: "슈퍼히어로 매거진",
    publishedAt: "2025-01-03",
    views: 7654,
    featured: false,
  },
  {
    id: 7,
    title: "IMAX 기술의 새로운 혁신",
    summary:
      "IMAX가 공개한 차세대 영화 상영 기술이 영화관 경험을 완전히 바꿀 것으로 예상됩니다.",
    content: "IMAX의 새로운 기술 혁신에 대해 알아봅니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    category: "기술",
    author: "시네마 테크",
    publishedAt: "2024-12-31",
    views: 11234,
    featured: false,
  },
  {
    id: 8,
    title: "인디펜던트 영화의 부상",
    summary:
      "독립 영화들이 메이저 스튜디오 영화들과 어깨를 나란히 하며 주목받고 있습니다.",
    content: "인디펜던트 영화의 성공 사례들을 분석해봅니다...",
    thumbnail: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    category: "개봉 소식",
    author: "인디 시네마",
    publishedAt: "2024-12-28",
    views: 8765,
    featured: false,
  },
  {
    id: 9,
    title: "홀로그램 기술과 영화의 만남",
    summary:
      "홀로그램 기술이 영화 제작과 상영에 가져올 혁신적 변화를 예측해봅니다.",
    content: "홀로그램 기술의 영화 산업 적용 사례를 살펴봅니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    category: "기술",
    author: "홀로테크 리뷰",
    publishedAt: "2024-12-25",
    views: 6543,
    featured: false,
  },
  {
    id: 10,
    title: "글로벌 박스오피스 2024 결산",
    summary: "2024년 전 세계 박스오피스 성과와 트렌드를 종합 분석합니다.",
    content: "2024년 글로벌 박스오피스 데이터를 분석합니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
    category: "박스오피스",
    author: "글로벌 박스오피스",
    publishedAt: "2024-12-22",
    views: 15432,
    featured: false,
  },
  {
    id: 11,
    title: "넷플릭스 vs 디즈니+ 경쟁 심화",
    summary:
      "스트리밍 서비스 간의 경쟁이 더욱 치열해지고 있습니다. 각 플랫폼의 전략을 비교 분석합니다.",
    content: "스트리밍 플랫폼들의 경쟁 현황을 살펴봅니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    category: "기술",
    author: "스트리밍 워치",
    publishedAt: "2024-12-20",
    views: 12876,
    featured: false,
  },
  {
    id: 12,
    title: "어벤져스 새로운 시대 예고",
    summary: "마블이 공개한 어벤져스 새로운 팀 구성과 향후 계획을 살펴봅니다.",
    content: "어벤져스의 새로운 시대에 대해 알아봅니다...",
    thumbnail: "https://image.tmdb.org/t/p/w500/qAKvGA39dyy1H7hf0m4mTGvkzr.jpg",
    category: "개봉 소식",
    author: "마블 인사이더",
    publishedAt: "2024-12-18",
    views: 19567,
    featured: false,
  },
  {
    id: 13,
    title: "중국 영화 시장의 성장",
    summary:
      "중국 영화 시장이 급속도로 성장하며 글로벌 영화 산업에 미치는 영향을 분석합니다.",
    content: "중국 영화 시장의 현황과 전망을 살펴봅니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
    category: "박스오피스",
    author: "아시아 시네마",
    publishedAt: "2024-12-15",
    views: 9234,
    featured: false,
  },
  {
    id: 14,
    title: "8K 해상도 영화 시대 개막",
    summary:
      "8K 해상도로 제작된 영화들이 등장하며 시각적 경험의 새로운 차원을 열고 있습니다.",
    content: "8K 영화 기술의 현재와 미래를 살펴봅니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    category: "기술",
    author: "4K/8K 리뷰",
    publishedAt: "2024-12-12",
    views: 7891,
    featured: false,
  },
  {
    id: 15,
    title: "블록버스터 영화의 새로운 공식",
    summary:
      "2025년 블록버스터 영화들이 보여주는 새로운 제작 공식과 트렌드를 분석합니다.",
    content: "블록버스터 영화의 변화하는 트렌드를 살펴봅니다...",
    thumbnail: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    category: "개봉 소식",
    author: "블록버스터 매거진",
    publishedAt: "2024-12-10",
    views: 14567,
    featured: false,
  },
  {
    id: 16,
    title: "한국 영화의 세계적 성공 비결",
    summary:
      "한국 영화가 전 세계적으로 인정받는 이유와 성공 요인을 심층 분석합니다.",
    content: "한국 영화의 글로벌 성공 사례를 분석합니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    category: "박스오피스",
    author: "한류 시네마",
    publishedAt: "2024-12-08",
    views: 16789,
    featured: false,
  },
  {
    id: 17,
    title: "메타버스 영화관 체험기",
    summary:
      "메타버스 내에서 즐기는 새로운 영화 관람 경험을 직접 체험해본 후기입니다.",
    content: "메타버스 영화관 체험 후기를 공유합니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    category: "기술",
    author: "메타버스 리포터",
    publishedAt: "2024-12-05",
    views: 10234,
    featured: false,
  },
  {
    id: 18,
    title: "여름 시즌 기대작 라인업",
    summary: "2025년 여름 시즌을 장식할 기대작들의 라인업을 미리 살펴봅니다.",
    content: "여름 시즌 기대작들을 소개합니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
    category: "개봉 소식",
    author: "시즌 가이드",
    publishedAt: "2024-12-03",
    views: 13456,
    featured: false,
  },
  {
    id: 19,
    title: "스트리밍 플랫폼별 수익 비교",
    summary: "주요 스트리밍 플랫폼들의 2024년 수익과 성과를 비교 분석합니다.",
    content: "스트리밍 플랫폼 수익 현황을 분석합니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/aKbulUG3weFzipR0xsQ3z7aDXLv.jpg",
    category: "박스오피스",
    author: "스트리밍 애널리스트",
    publishedAt: "2024-12-01",
    views: 11789,
    featured: false,
  },
  {
    id: 20,
    title: "AI 성우 기술의 윤리적 논란",
    summary:
      "AI 기술로 제작된 성우 더빙이 영화 산업에 미치는 영향과 윤리적 이슈를 다룹니다.",
    content: "AI 성우 기술의 현재와 논란점을 살펴봅니다...",
    thumbnail:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    category: "기술",
    author: "AI 보이스 리뷰",
    publishedAt: "2024-11-28",
    views: 8945,
    featured: false,
  },
];

const categories = ["전체", "개봉 소식", "기술", "박스오피스"];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, popular

  // 카테고리로 필터링
  let filteredNews = mockNews.filter((article) => {
    const matchesCategory =
      selectedCategory === "전체" || article.category === selectedCategory;
    return matchesCategory;
  });

  // 정렬
  filteredNews = filteredNews.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        );
      case "popular":
        return b.views - a.views;
      case "newest":
      default:
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }
  });

  // 인기 기사 (전체 중에서 조회수 상위 2개, 카테고리 무관)
  const popularNews = [...mockNews]
    .sort((a, b) => b.views - a.views)
    .slice(0, 2);

  // 일반 기사 (카테고리 필터링 후 처음 6개만 표시)
  const regularNews = filteredNews.slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">기사</h1>
        </div>

        {/* 인기 기사 섹션 (조회수 상위 2개) */}
        {popularNews.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 text-transparent bg-clip-text">
              🔥 지금 뜨는 기사
              </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {popularNews.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group cursor-pointer"
                >
                  <article className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:from-gray-750 hover:to-gray-850 transition-all duration-300 border border-gray-700 hover:border-violet-500">
                    {/* 썸네일 */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={article.thumbnail}
                        alt={article.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* 인기 배지 */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          HOT
                        </span>
                      </div>
                      {/* 카테고리 태그 */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                        {article.title}
                      </h2>
                      <p className="text-gray-400 text-base mb-4 line-clamp-3">
                        {article.summary}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{article.author}</span>
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
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
                          <span className="text-orange-400 font-bold">
                            {article.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 카테고리 탭 & 필터 */}
        <div className="mb-8 space-y-6">
          {/* 카테고리 탭 */}
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-0" aria-label="카테고리">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative py-3 px-6 text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "text-violet-400 border-b-2 border-violet-400"
                      : "text-gray-400 hover:text-gray-300"
                  } ${index === 0 ? "rounded-tl-lg" : ""} ${
                    index === categories.length - 1 ? "rounded-tr-lg" : ""
                  }`}
                >
                  <span className="relative">
                    {category}
                    
                  </span>
                  {/* 카테고리별 뉴스 개수 표시 */}
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      selectedCategory === category
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {category === "전체"
                      ? mockNews.length
                      : mockNews.filter(
                          (article) => article.category === category
                        ).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* 정렬 옵션 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {selectedCategory === "전체"
                  ? `전체 ${filteredNews.length}개`
                  : `${selectedCategory} ${filteredNews.length}개 `}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="popular">인기순 (조회수)</option>
              </select>
            </div>
          </div>
        </div>
        {/* 일반 뉴스 그리드 */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="group cursor-pointer"
              >
                <article className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors duration-300">
                  {/* 썸네일 */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.thumbnail}
                      alt={article.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* 카테고리 태그 */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {article.summary}
                    </p>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{article.author}</span>
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
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
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* 검색 결과 없음 */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-gray-400 text-lg mb-4">
              &ldquo;{selectedCategory}&rdquo; 카테고리에 해당하는 뉴스가
              없습니다
            </div>
            <p className="text-gray-500 mb-6">다른 카테고리를 선택해보세요</p>
            <button
              onClick={() => setSelectedCategory("전체")}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              전체 뉴스 보기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
