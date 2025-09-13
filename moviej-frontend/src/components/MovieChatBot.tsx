"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { recommendationEngine } from '@/lib/recommendationEngine';
import { EnhancedMovieRecommendation } from '@/types/recommendation';

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
  movieRecommendations?: EnhancedMovieRecommendation[];
  isAdvancedRecommendation?: boolean;
}

interface ChatStep {
  question: string;
  options?: string[];
  type: "genre" | "mood" | "actor" | "year" | "recommendation_type" | "final";
}

export default function MovieChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userPreferences, setUserPreferences] = useState<{
    genre?: string;
    mood?: string;
    actor?: string;
    year?: string;
    recommendationType?: string;
  }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [userId] = useState(`user_${Date.now()}`); // 임시 사용자 ID
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const chatSteps: ChatStep[] = [
    {
      question: "안녕하세요! 🎬 AI 영화 추천 봇입니다. 어떤 방식의 추천을 원하시나요?",
      options: ["🧠 AI 개인화 추천", "🎯 장르 기반 추천", "👥 협업 필터링", "📊 하이브리드 추천"],
      type: "recommendation_type"
    },
    {
      question: "어떤 장르의 영화를 좋아하시나요?",
      options: ["액션", "로맨스", "코미디", "공포", "드라마", "SF", "스릴러", "애니메이션"],
      type: "genre"
    },
    {
      question: "어떤 분위기의 영화를 원하시나요?",
      options: ["신나는", "감동적인", "긴장감 있는", "편안한", "생각해볼만한", "재미있는"],
      type: "mood"
    },
    {
      question: "좋아하는 배우나 감독이 있으신가요? (선택사항)",
      options: ["톰 크루즈", "레오나르도 디카프리오", "스칼릿 요한슨", "크리스토퍼 놀란", "봉준호", "직접 입력", "상관없음"],
      type: "actor"
    },
    {
      question: "언제 나온 영화를 선호하시나요?",
      options: ["최신영화 (2020년 이후)", "2010년대", "2000년대", "90년대 이전", "상관없음"],
      type: "year"
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(chatSteps[0].question, chatSteps[0].options);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (content: string, options?: string[], recommendations?: EnhancedMovieRecommendation[], isAdvanced = false) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content,
        timestamp: new Date(),
        movieRecommendations: recommendations,
        isAdvancedRecommendation: isAdvanced
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    
    const currentStepData = chatSteps[currentStep];
    const newPreferences = { ...userPreferences };
    
    // 사용자 선택 저장
    switch (currentStepData.type) {
      case "recommendation_type":
        newPreferences.recommendationType = option;
        break;
      case "genre":
        newPreferences.genre = option;
        break;
      case "mood":
        newPreferences.mood = option;
        break;
      case "actor":
        newPreferences.actor = option;
        break;
      case "year":
        newPreferences.year = option;
        break;
    }
    
    setUserPreferences(newPreferences);
    
    // 다음 단계로 진행
    const nextStep = currentStep + 1;
    if (nextStep < chatSteps.length) {
      setCurrentStep(nextStep);
      setTimeout(() => {
        let nextQuestion = chatSteps[nextStep].question;
        
        // AI 추천 선택 시 질문 수정
        if (newPreferences.recommendationType === "🧠 AI 개인화 추천") {
          if (nextStep === 1) {
            nextQuestion = "AI가 더 정확한 추천을 위해 몇 가지 질문드릴게요. 어떤 장르를 선호하시나요?";
          }
        }
        
        addBotMessage(nextQuestion, chatSteps[nextStep].options);
      }, 1500);
    } else {
      // 최종 추천 생성
      setTimeout(() => {
        generateAdvancedRecommendations(newPreferences);
      }, 1500);
    }
  };

  const generateAdvancedRecommendations = async (preferences: typeof userPreferences) => {
    setIsTyping(true);
    
    try {
      let recommendations: EnhancedMovieRecommendation[] = [];
      
      // 추천 방식에 따라 다른 알고리즘 사용
      switch (preferences.recommendationType) {
        case "🧠 AI 개인화 추천":
          recommendations = await generatePersonalizedRecommendations(preferences);
          break;
        case "🎯 장르 기반 추천":
          recommendations = await generateContentBasedRecommendations(preferences);
          break;
        case "👥 협업 필터링":
          recommendations = await generateCollaborativeRecommendations();
          break;
        case "📊 하이브리드 추천":
          recommendations = await generateHybridRecommendations(preferences);
          break;
        default:
          recommendations = await generateContentBasedRecommendations(preferences);
      }

      const botMessage = `${preferences.recommendationType || "AI 추천"}으로 ${preferences.genre} 장르의 ${preferences.mood} 영화를 찾아드렸어요! 🎭\n\n개인화된 추천 영화들을 확인해보세요:`;
      
      setTimeout(() => {
        addBotMessage(botMessage, undefined, recommendations, true);
        setIsTyping(false);
      }, 2000);
      
    } catch (error) {
      console.error("AI 추천 오류:", error);
      
      // 오류 시 기본 추천
      const fallbackRecommendations = await generateFallbackRecommendations(preferences);
      
      setTimeout(() => {
        addBotMessage(
          "죄송해요, AI 추천 시스템에 일시적인 오류가 발생했습니다. 대신 인기 영화를 추천해드릴게요! 🎬",
          undefined,
          fallbackRecommendations,
          false
        );
        setIsTyping(false);
      }, 2000);
    }
  };

  // AI 개인화 추천 (사용자 프로필 기반)
  const generatePersonalizedRecommendations = async (preferences: typeof userPreferences): Promise<EnhancedMovieRecommendation[]> => {
    // 추천 엔진 사용
    try {
      const result = await recommendationEngine.generateRecommendations({
        userId,
        count: 3,
        algorithms: ['hybrid'],
        filters: {
          minRating: 7.0,
          excludeWatched: true
        }
      });
      
      return result.recommendations;
    } catch (error) {
      console.error("Personalized recommendation error:", error);
      return generateContentBasedRecommendations(preferences);
    }
  };

  // 콘텐츠 기반 추천
  const generateContentBasedRecommendations = async (preferences: typeof userPreferences): Promise<EnhancedMovieRecommendation[]> => {
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    
    // 장르 ID 매핑
    const genreMap: {[key: string]: number} = {
      "액션": 28, "로맨스": 10749, "코미디": 35, "공포": 27,
      "드라마": 18, "SF": 878, "스릴러": 53, "애니메이션": 16
    };

    const genreId = preferences.genre ? genreMap[preferences.genre] : "";
    
    // 연도 필터
    let yearFilter = "";
    if (preferences.year === "최신영화 (2020년 이후)") {
      yearFilter = "&primary_release_date.gte=2020-01-01";
    } else if (preferences.year === "2010년대") {
      yearFilter = "&primary_release_date.gte=2010-01-01&primary_release_date.lte=2019-12-31";
    } else if (preferences.year === "2000년대") {
      yearFilter = "&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31";
    } else if (preferences.year === "90년대 이전") {
      yearFilter = "&primary_release_date.lte=1999-12-31";
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=ko-KR&sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=7.5${genreId ? `&with_genres=${genreId}` : ""}${yearFilter}&page=1`
    );
    
    const data = await response.json();
    const movies = data.results?.slice(0, 3) || [];
    
    return movies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview,
      genres: [],
      cast: [],
      directors: [],
      score: movie.vote_average,
      reasons: [
        {
          type: 'genre' as const,
          description: `${preferences.genre} 장르와 ${preferences.mood} 분위기를 좋아하신다고 하셔서 추천드려요!`,
          confidence: 0.85
        },
        {
          type: 'rating' as const,
          description: `평점 ${movie.vote_average.toFixed(1)}점의 높은 평가를 받은 작품입니다`,
          confidence: 0.9
        }
      ],
      confidence: 0.85,
      algorithm: 'content'
    }));
  };

  // 협업 필터링 추천 (가상)
  const generateCollaborativeRecommendations = async (): Promise<EnhancedMovieRecommendation[]> => {
    // 실제로는 사용자 간 유사도 기반으로 추천
    // 여기서는 인기도 + 평점 기반으로 시뮬레이션
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ko-KR&page=1`
    );
    
    const data = await response.json();
    const movies = data.results?.slice(0, 3) || [];
    
    return movies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview,
      genres: [],
      cast: [],
      directors: [],
      score: movie.popularity / 1000,
      reasons: [
        {
          type: 'similar_users' as const,
          description: '비슷한 취향의 사용자들이 높게 평가한 영화입니다',
          confidence: 0.75
        },
        {
          type: 'trending' as const,
          description: '현재 많은 사람들이 관심을 가지고 있는 인기 영화입니다',
          confidence: 0.8
        }
      ],
      confidence: 0.75,
      algorithm: 'collaborative'
    }));
  };

  // 하이브리드 추천
  const generateHybridRecommendations = async (preferences: typeof userPreferences): Promise<EnhancedMovieRecommendation[]> => {
    const [contentBased, collaborative] = await Promise.all([
      generateContentBasedRecommendations(preferences),
      generateCollaborativeRecommendations()
    ]);

    // 점수 기반으로 혼합
    const combined = [...contentBased, ...collaborative]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return combined.map(rec => ({
      ...rec,
      algorithm: 'hybrid',
      reasons: [
        ...rec.reasons,
        {
          type: 'rating' as const,
          description: '콘텐츠 기반 + 협업 필터링 하이브리드 추천',
          confidence: 0.9
        }
      ]
    }));
  };

  // 폴백 추천 (오류 시)
  const generateFallbackRecommendations = async (preferences: typeof userPreferences): Promise<EnhancedMovieRecommendation[]> => {
    return [
      {
        id: 157336,
        title: "인터스텔라",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        vote_average: 8.6,
        release_date: "2014-11-07",
        overview: "우주를 배경으로 한 SF 대작으로, 가족애와 인류의 생존을 다룬 감동적인 작품입니다.",
        genres: [],
        cast: [],
        directors: [],
        score: 8.6,
        reasons: [
          {
            type: 'rating' as const,
            description: `${preferences.genre} 장르와 ${preferences.mood} 분위기를 좋아하신다고 하셔서 추천드려요!`,
            confidence: 0.7
          }
        ],
        confidence: 0.7,
        algorithm: 'fallback'
      }
    ];
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setUserPreferences({});
    addBotMessage(chatSteps[0].question, chatSteps[0].options);
  };

  return (
    <>
      {/* 챗봇 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? "bg-gray-700 hover:bg-gray-600" 
            : "bg-violet-600 hover:bg-violet-700"
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">영화 추천 봇</h3>
                <p className="text-xs text-gray-400">온라인</p>
              </div>
            </div>
            <button 
              onClick={resetChat}
              className="text-gray-400 hover:text-white transition-colors"
              title="새로 시작"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user" 
                    ? "bg-violet-600 text-white" 
                    : "bg-gray-800 text-gray-200"
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  
                  {/* 영화 추천 카드들 */}
                  {message.movieRecommendations && (
                    <div className="mt-4 space-y-3">
                      {message.movieRecommendations.map((movie) => (
                        <div 
                          key={movie.id} 
                          className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors cursor-pointer"
                          onClick={() => {
                            router.push(`/movie/${movie.id}`);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white text-sm truncate">{movie.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-yellow-400 text-xs">★ {movie.vote_average.toFixed(1)}</span>
                                <span className="text-gray-400 text-xs">{new Date(movie.release_date).getFullYear()}</span>
                                {message.isAdvancedRecommendation && (
                                  <span className="text-violet-400 text-xs">✨ AI 추천</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-300 mt-1">
                                {message.isAdvancedRecommendation && movie.reasons && movie.reasons.length > 0 ? (
                                  <div className="space-y-1">
                                    {movie.reasons.slice(0, 2).map((reason, idx) => (
                                      <div key={idx} className="flex items-center gap-1">
                                        <span className="text-violet-400">•</span>
                                        <span className="line-clamp-1">{reason.description}</span>
                                      </div>
                                    ))}
                                    <div className="flex items-center gap-1">
                                      <span className="text-green-400 text-xs">신뢰도: {(movie.confidence * 100).toFixed(0)}%</span>
                                      <span className="text-blue-400 text-xs">({movie.algorithm})</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="line-clamp-2">
                                    {movie.overview?.substring(0, 80)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* 타이핑 인디케이터 */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 옵션 버튼들 */}
          {!isTyping && currentStep < chatSteps.length && (
            <div className="p-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {chatSteps[currentStep]?.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="text-sm p-2 bg-gray-800 hover:bg-violet-600 text-gray-200 hover:text-white rounded-lg transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
 