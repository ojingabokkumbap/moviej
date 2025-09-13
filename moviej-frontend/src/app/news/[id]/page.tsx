"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// 임시 뉴스 데이터 (실제로는 API에서 가져올 예정)
const mockNews = [
  {
    id: 1,
    title: "2025년 최고 기대작, 아바타 3 공개",
    summary: "제임스 카메론 감독의 아바타 시리즈 3편이 드디어 공개됩니다. 판도라의 새로운 모험이 시작됩니다.",
    content: `
      <h2>아바타 3: 불의 씨앗 - 새로운 판도라의 모험</h2>
      
      <p>제임스 카메론 감독의 아바타 시리즈 3편이 2025년 12월 개봉 예정입니다. 전작 '아바타: 물의 길'의 성공에 이어, 이번에는 판도라의 화산 지역을 배경으로 한 새로운 이야기가 펼쳐집니다.</p>
      
      <h3>주요 내용</h3>
      <ul>
        <li>새로운 나비족 부족 '화염족' 등장</li>
        <li>화산 생태계의 독특한 생명체들</li>
        <li>제이크 설리 가족의 새로운 모험</li>
        <li>혁신적인 수중 및 화산 촬영 기법</li>
      </ul>
      
      <p>카메론 감독은 "아바타 3에서는 불과 물의 대비를 통해 판도라의 또 다른 면을 보여주고 싶었다"며 "관객들이 상상할 수 없는 새로운 시각적 경험을 제공할 것"이라고 말했습니다.</p>
      
      <h3>기술적 혁신</h3>
      <p>이번 작품에서는 화산 환경을 실감나게 표현하기 위해 새로운 3D 기술과 특수 효과가 도입되었습니다. 특히 용암과 화산재 시뮬레이션은 지금까지 영화에서 볼 수 없었던 수준의 리얼리즘을 자랑합니다.</p>
      
      <p>또한 IMAX와 Dolby Atmos를 활용한 몰입형 사운드 시스템으로 관객들이 마치 판도라에 직접 있는 듯한 경험을 제공할 예정입니다.</p>
    `,
    thumbnail: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    category: "개봉 소식",
    author: "영화 매거진",
    publishedAt: "2025-01-15",
    views: 15420,
    likes: 2340,
    tags: ["아바타", "제임스 카메론", "SF", "판도라", "3D"],
  },
  {
    id: 2,
    title: "마블 페이즈 6 계획 발표",
    summary: "마블 스튜디오가 새로운 페이즈 6 계획을 공개했습니다. X-Men과 판타스틱 포의 합류가 확정되었습니다.",
    content: `
      <h2>마블 시네마틱 유니버스 페이즈 6 로드맵 공개</h2>
      
      <p>마블 스튜디오가 코믹콘에서 페이즈 6 로드맵을 공개했습니다. 2026년부터 2028년까지 3년간 총 12편의 영화와 8편의 디즈니+ 시리즈가 공개될 예정입니다.</p>
      
      <h3>주요 발표 내용</h3>
      <ul>
        <li><strong>X-Men</strong> 본격 MCU 합류 확정</li>
        <li><strong>판타스틱 포</strong> 새로운 캐스팅과 함께 재시작</li>
        <li><strong>데드풀 4</strong> 2026년 여름 개봉</li>
        <li><strong>어벤져스: 시크릿 워즈</strong> 페이즈 6 피날레</li>
      </ul>
      
      <h3>새로운 캐릭터들</h3>
      <p>페이즈 6에서는 기존 MCU 캐릭터들과 함께 X-Men, 판타스틱 포 멤버들이 본격적으로 활동하게 됩니다. 특히 울버린의 후계자와 젊은 X-Men 팀의 등장이 주목받고 있습니다.</p>
      
      <p>케빈 파이기 사장은 "페이즈 6는 MCU의 새로운 전환점이 될 것"이라며 "팬들이 오랫동안 기다려온 캐릭터들이 드디어 MCU에 합류하게 되어 기쁘다"고 밝혔습니다.</p>
    `,
    thumbnail: "https://image.tmdb.org/t/p/w500/qAKvGA39dyy1H7hf0m4mTGvkzr.jpg",
    category: "업계 소식",
    author: "슈퍼히어로 뉴스",
    publishedAt: "2025-01-12",
    views: 23890,
    likes: 4567,
    tags: ["마블", "MCU", "X-Men", "판타스틱 포", "어벤져스"],
  },
  // 더 많은 뉴스 데이터...
];

// 댓글 데이터
const mockComments = [
  {
    id: 1,
    author: "영화광",
    content: "드디어 아바타 3가 나오는군요! 너무 기대됩니다.",
    publishedAt: "2025-01-15T10:30:00Z",
    likes: 24,
  },
  {
    id: 2,
    author: "판도라팬",
    content: "제임스 카메론의 기술력은 정말 대단해요. 이번에는 어떤 혁신을 보여줄까요?",
    publishedAt: "2025-01-15T11:15:00Z",
    likes: 18,
  },
  {
    id: 3,
    author: "SF매니아",
    content: "화산 지역 설정이 흥미롭네요. 물의 길과는 완전히 다른 느낌일 것 같아요.",
    publishedAt: "2025-01-15T12:00:00Z",
    likes: 15,
  },
];

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const id = parseInt(params.id as string);
    const foundArticle = mockNews.find(news => news.id === id);
    if (foundArticle) {
      setArticle(foundArticle);
      setLikeCount(foundArticle.likes);
    }
  }, [params.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: "사용자", // 실제로는 로그인한 사용자 이름
        content: newComment,
        publishedAt: new Date().toISOString(),
        likes: 0,
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl text-gray-400">뉴스를 찾을 수 없습니다</h1>
            <Link href="/news" className="text-violet-400 hover:text-violet-300 mt-4 inline-block">
              뉴스 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>

        {/* 기사 헤더 */}
        <header className="mb-8">
          {/* 카테고리 */}
          <div className="mb-4">
            <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {/* 요약 */}
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {article.summary}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-400 border-b border-gray-700 pb-6">
            <div className="flex items-center space-x-6">
              <span className="font-medium">{article.author}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{article.views.toLocaleString()}</span>
              </div>
            </div>

            {/* 좋아요 버튼 */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>{likeCount.toLocaleString()}</span>
            </button>
          </div>
        </header>

        {/* 썸네일 이미지 */}
        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        {/* 본문 내용 */}
        <article className="prose prose-invert prose-lg max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="text-gray-300 leading-relaxed"
          />
        </article>

        {/* 태그 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">태그</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 댓글 섹션 */}
        <section className="border-t border-gray-700 pt-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            댓글 ({comments.length})
          </h3>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해주세요..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              댓글 작성
            </button>
          </form>

          {/* 댓글 목록 */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.author[0]}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{comment.author}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.publishedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm">{comment.likes}</span>
                  </button>
                </div>
                <p className="text-gray-300 leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 관련 뉴스 */}
        <section className="border-t border-gray-700 pt-8 mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">관련 뉴스</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockNews.slice(0, 2).filter(news => news.id !== article.id).map((relatedNews) => (
              <Link
                key={relatedNews.id}
                href={`/news/${relatedNews.id}`}
                className="group"
              >
                <article className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={relatedNews.thumbnail}
                      alt={relatedNews.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {relatedNews.title}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {relatedNews.summary}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
