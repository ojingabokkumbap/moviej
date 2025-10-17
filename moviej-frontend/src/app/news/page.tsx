"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

// 임시 뉴스 데이터 (실제로는 API에서 가져올 예정)
const mockNews = [
  {
    id: 1,
    title: "박찬욱의 신작 <어쩔수가없다> 1차 포스터 & 티저 공개, 9월 개봉 소식",
    summary:
      "<헤어질 결심> 이후 선보이는 12번째 장편 영화 〈어쩔수가없다〉가 2025년 9월 개봉을 확정 지으며, 1차 포스터와 티저 예고편을 함께 공개했다. ",
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA3MjJfMTY2/MDAxNzUzMTYzODQ5Nzkz.m1-Hr2zaRccL5kQFxBzjayPH1FeOg5wUz-oPzH_t-nkg.enP0gY0M_wjXv4SlLPoVPiCwwk62SIEy7Ve0kG-6rdQg.JPEG/common.jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-15",
    featured: true,
  },
  {
    id: 2,
    title: "코고나다 감독, 콜린 파렐, 마고 로비의 판타지 로맨스 <빅 볼드 뷰티풀>, 10월 24일 국내 개봉 확정",
    summary:
      "코고나다 감독의 세 번째 장편영화 <빅 볼드 뷰티풀>은 그의 2017년 데뷔작 <콜럼버스>와 2021년작 <애프터 양> 이후 4년 만의 신작이다.",
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA5MjFfMjA5/MDAxNzU4MzgxMzI3OTcy.V0Rs613eSj2YmhkuIf_XIrCtU9zld399qCEmWFyTO24g.pYzugwO6aziggTiPEYva-rtcqJxPgVegf3bRXUFBVIEg.JPEG/%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C_(20).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-12",
    featured: true,
  },
  {
    id: 3,
    title: "40년 만에 돌아온 역대 최고의 콘서트 영화 <스탑 메이킹 센스>, 8월 13일 개봉 소식",
    summary:
      "전설이 스크린으로 귀환하다! <스탑 메이킹 센스> 4K 리마스터링 국내 개봉 소식",
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA4MDlfMSAg/MDAxNzU0NjY5MjUzNTU5.P-p2gbKfqFQA8RjqU60OQam6gvsYG8gcMiZ_J-30kSAg.VnKqBEF4xVWFqtu3-eAQv5LDwMGNY8-ueQ2Ha2NGdRMg.JPEG/%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C_(8).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-10",
    featured: false,
  },
  {
    id: 4,
    title: "<트론: 아레스> 오프닝 성적 저조... <귀멸의 칼날: 무한성편> 올해 5위 흥행작 등극",
    summary:
      "​토론토 블루제이스와 시애틀 매리너스의 MLB 플레이오프 경기, 그리고 12경기의 NFL 경기로 인해 디즈니의 〈트론: 아레스〉는 이번 주말 극장가에서 다소 주춤하며 3일간 3,350만 달러, 전 세계 6,050만 달러의 데뷔 성적을 기록했습니다.",
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTEwMTNfMTAx/MDAxNzYwMzQ2MjA3NTU1.lgPsaAWR2GE9CUwbetqN9Gf7qBCcD-r6AR-5R_GfGhgg.cG7YTGkdyg59ISdEajVw80_b4Rd4c5cVflnDpB4PqKEg.JPEG/Tron-Ares-4.jpg?type=w966",
    category: "박스오피스",
    publishedAt: "2025-01-08",
    featured: false,
  },
  {
    id: 5,
    title: "연상호 감독의 신작 영화 <얼굴>, 9월 11일 개봉 소식",
    summary:
      "진실이 민낯을 드러냈다. 영화 <얼굴> 9월 개봉 소식",
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA4MjVfMjUz/MDAxNzU2MDUzNzgxNTU0.8QOG-VRyygFD3vI1V7G-Fm67qLKqBRg7qS96Faon_cEg.U1fQ1dnwDZf-GlH5_w6jJB8SDgp7xv3sfmYdsuYqHOIg.JPEG/common_(11).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2025-01-05",
    featured: false,
  },
  {
    id: 6,
    title: "미리 보는 AI 시대의 영화…완성도는 '글쎄' ('중간계')",
    summary:
      " AI 기술의 현재와 미래를 보여주는 작품이 관객과 만났다.",
    thumbnail:
      "https://thumbnews.nateimg.co.kr/view610///news.nateimg.co.kr/orgImg/tr/2025/10/17/f6a5b0a9-f155-4915-9bc0-a0289c747a96.jpg",
    category: "기술",
    publishedAt: "2025-01-03",
    featured: false,
  },
  {
    id: 7,
    title: "2025년 칸 영화제 황금종려상 자파르 파나히 감독의 <그저 사고였을 뿐>, 전 세계 최초 한국 개봉 소식",
    summary:
      "2025년 칸 황금종려상 수상작 <그저 사고였을 뿐> 전 세계 최초 한국 개봉",
    thumbnail: "https://blogfiles.pstatic.net/MjAyNTA1MjlfODAg/MDAxNzQ4NDQ1OTQ3Nzcx.2FYe6nsE0oJwNbXDZ9eWH0kJrxp-oX8nwHX9uPZmR3Eg.ve5nfAjZlknhaMUWRCotS4_G5cY-8M89wP6wcobQDP8g.JPEG/SE-b3843a0f-9a02-4f90-ad4e-4fccbd354a70.jpg?type=w1",
    category: "개봉 소식",
    publishedAt: "2025-01-01",
    featured: false,
  },
  {
    id: 8,
    title: "영화와 TV 프로그램의 언어 더빙을 완전히 바꿔놓을 인공지능 기술",
    summary:
      "스웨덴 영화 'Watch the Skies'는 인공지능을 활용해 영어로 더빙이 입혀졌다",
    thumbnail:
      "https://ichef.bbci.co.uk/ace/ws/800/cpsprodpb/93b2/live/94396bc0-779c-11f0-a20f-3b86f375586a.jpg.webp",
    category: "기술",
    publishedAt: "2024-12-28",
    featured: false,
  },
  {
    id: 9,
    title: "올 추석, 웃기는 놈이 보스다!",
    summary: "올 추석, 온 가족이 함께 즐길 수 있는 제대로 된 코미디가 찾아온다!",
    thumbnail:
      "https://postfiles.pstatic.net/MjAyNTA5MjRfMTI1/MDAxNzU4NzAzNDczNDc2.e4hMQ5xuX2epztEBfoN677kpnt3392K1qTC78lvK_5sg.sG8wu6kG8XYy5fzByXHxMiF_fjtLct9zDv2sdpMR1PQg.JPEG/common_(26).jpeg?type=w773",
    category: "개봉 소식",
    publishedAt: "2024-12-25",
    featured: false,
  },
  {
    id: 10,
    title: "일본 애니 초강세…‘주술회전’·‘체인소맨’ 나란히 1·2위[MK박스오피스]",
    summary:
      "‘극장판 주술회전: 회옥·옥절’이 개봉 날 박스오피스 왕좌에 오르며 일본 애니메이션의 강세를 이어 갔다.",
    thumbnail:
      "https://pimg.mk.co.kr/news/cms/202510/17/news-p.v1.20251017.b42966691d7e44b086374cac7a55c302_P1.jpeg",
    category: "박스오피스",
    publishedAt: "2024-12-20",
    featured: false,
  },
  {
    id: 11,
    title: "'AI기술과 영화의 만남' 8∼10일 제주AI국제필름페스티벌",
    summary:
      "인공지능(AI)을 활용해 만든 세계 각국의 영화를 만나볼 수 있는 행사가 제주에서 열린다.",
    thumbnail:
      "https://www.newsdream.kr/news/photo/202305/42197_12989_412.jpg",
    category: "기술",
    publishedAt: "2024-12-18",
    featured: false,
  },
  {
    id: 12,
    title: "한국 코미디 vs 일본 애니메이션…박스오피스 ‘접전’",
    summary:
      "추석 연휴를 맞아 극장가가 활기를 띠는 가운데, 코미디 영화 ‘보스’가 새롭게 박스오피스 1위에 올랐다.",
    thumbnail:
      "https://img4.daumcdn.net/thumb/R658x0.q70/?fname=https://t1.daumcdn.net/news/202510/04/kbs/20251004111451438jzfx.jpg",
    category: "박스오피스",
    publishedAt: "2024-12-15",
    featured: false,
  },
];

const categories = ["전체", "개봉 소식", "기술", "박스오피스"];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [displayCount, setDisplayCount] = useState(6);

  // Intersection Observer로 무한 스크롤 감지
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // 카테고리로 필터링
  const filteredNews = mockNews.filter((article) => {
    const matchesCategory =
      selectedCategory === "전체" || article.category === selectedCategory;
    return matchesCategory;
  });

  // 인기 기사 (featured가 true인 기사들)
  const popularNews = mockNews.filter((article) => article.featured);

  // 일반 기사 (카테고리 필터링 후 displayCount개만 표시)
  const regularNews = filteredNews.slice(0, displayCount);

  // 더 불러올 기사가 있는지 확인
  const hasMore = displayCount < filteredNews.length;

  // inView가 true가 되면 6개씩 추가 로드
  useEffect(() => {
    if (inView && hasMore) {
      setDisplayCount((prev) => prev + 6);
    }
  }, [inView, hasMore]);

  // 카테고리 변경시 displayCount 초기화
  useEffect(() => {
    setDisplayCount(6);
  }, [selectedCategory]);

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "기사 - MovieJ";
  }, []);

  return (
    <main className="min-h-scree text-white pt-20">
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
                        {article.title.length > 30 ? article.title.slice(0, 30) + "..." : article.title}
                      </h2>
                      <p className="text-gray-400 text-base mb-4 line-clamp-3">
                        {article.summary}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 카테고리 탭 */}
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
                      {article.title.length > 23 ? article.title.slice(0, 23) + "..." : article.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-10">
                      {article.summary.length > 70 ? article.summary.slice(0, 70) + "..." : article.summary}
                    </p>

                    {/* 메타 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* 스크롤 감지용 요소 */}
        {hasMore && (
          <div ref={ref} className="h-20 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-400">
              <svg
                className="animate-spin h-5 w-5 text-violet-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm">추가 기사를 불러오는 중...</p>
            </div>
          </div>
        )}

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
