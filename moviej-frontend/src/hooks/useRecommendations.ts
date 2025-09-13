import { useState, useEffect, useCallback } from 'react';
import { recommendationEngine } from '@/lib/recommendationEngine';
import { EnhancedMovieRecommendation, RecommendationRequest } from '@/types/recommendation';

interface UseRecommendationsResult {
  recommendations: EnhancedMovieRecommendation[];
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  updateUserActivity: (movieId: number, rating?: number) => Promise<void>;
}

/**
 * 실시간 AI 추천 시스템을 위한 React Hook
 */
export function useRecommendations(userId: string): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<EnhancedMovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 추천 새로고침
  const refreshRecommendations = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: RecommendationRequest = {
        userId,
        count: 10,
        algorithms: ['hybrid'], // 하이브리드 추천 사용
        filters: {
          minRating: 6.5,
          excludeWatched: true
        }
      };

      const result = await recommendationEngine.generateRecommendations(request);
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : '추천 생성 중 오류가 발생했습니다');
      console.error('Recommendation refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 사용자 활동 업데이트 (영화 시청, 평점 등)
  const updateUserActivity = useCallback(async (movieId: number, rating?: number) => {
    try {
      // 임시 영화 데이터 (실제로는 TMDB에서 가져와야 함)
      const movieData = {
        id: movieId,
        title: 'Movie Title',
        release_date: '2023-01-01',
        vote_average: 7.5
      };

      // 사용자 프로필 업데이트
      await recommendationEngine.updateUserProfile(userId, movieData, rating);
      
      // 실시간 추천 업데이트
      await recommendationEngine.updateRecommendationsRealtime(userId);
      
      // 추천 새로고침
      await refreshRecommendations();
    } catch (err) {
      console.error('User activity update error:', err);
    }
  }, [userId, refreshRecommendations]);

  // 초기 추천 로드
  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  // 주기적 추천 업데이트 (5분마다)
  useEffect(() => {
    const interval = setInterval(refreshRecommendations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refreshRecommendations,
    updateUserActivity
  };
}

/**
 * 영화 상호작용 추적을 위한 Hook
 */
export function useMovieInteractions(userId: string) {
  const { updateUserActivity } = useRecommendations(userId);

  const trackMovieView = useCallback(async (movieId: number) => {
    await updateUserActivity(movieId);
  }, [updateUserActivity]);

  const trackMovieRating = useCallback(async (movieId: number, rating: number) => {
    await updateUserActivity(movieId, rating);
  }, [updateUserActivity]);

  const trackMovieLike = useCallback(async (movieId: number) => {
    await updateUserActivity(movieId, 4.5); // 좋아요를 4.5점으로 변환
  }, [updateUserActivity]);

  const trackMovieShare = useCallback(async (movieId: number) => {
    await updateUserActivity(movieId, 4.0); // 공유를 4.0점으로 변환
  }, [updateUserActivity]);

  return {
    trackMovieView,
    trackMovieRating,
    trackMovieLike,
    trackMovieShare
  };
}

/**
 * 실시간 추천 알림을 위한 Hook
 */
export function useRecommendationNotifications(userId: string) {
  const [notifications, setNotifications] = useState<{
    id: string;
    type: 'new_recommendation' | 'trending' | 'friend_activity';
    message: string;
    movieId?: number;
    timestamp: Date;
  }[]>([]);

  useEffect(() => {
    // WebSocket 또는 Server-Sent Events를 통한 실시간 알림
    // 여기서는 시뮬레이션
    const simulateNotification = () => {
      const notifications = [
        {
          id: Date.now().toString(),
          type: 'new_recommendation' as const,
          message: '새로운 AI 추천 영화가 있습니다!',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          type: 'trending' as const,
          message: '지금 인기 급상승 중인 영화를 확인해보세요!',
          timestamp: new Date()
        }
      ];
      
      setNotifications(prev => [...prev, ...notifications].slice(-5)); // 최대 5개 유지
    };

    // 10분마다 알림 시뮬레이션
    const interval = setInterval(simulateNotification, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    dismissNotification,
    clearAllNotifications
  };
}
