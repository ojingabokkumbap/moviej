import { 
  UserProfile, 
  MovieFeatures, 
  RecommendationScore, 
  SimilarUser, 
  RecommendationRequest,
  RecommendationResponse,
  EnhancedMovieRecommendation,
  RecommendationReason
} from '@/types/recommendation';

/**
 * AI 기반 영화 추천 엔진
 * 협업 필터링, 콘텐츠 기반 필터링, 하이브리드 알고리즘 구현
 */
export class MovieRecommendationEngine {
  private readonly API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  private userProfiles: Map<string, UserProfile> = new Map();
  private movieFeatures: Map<number, MovieFeatures> = new Map();
  private userSimilarities: Map<string, SimilarUser[]> = new Map();

  /**
   * 사용자 프로필 업데이트 (시청 이력, 평점 기반)
   */
  async updateUserProfile(userId: string, watchedMovie: any, userRating?: number): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createNewUserProfile(userId);
    }

    // 영화 상세 정보 가져오기
    const movieDetails = await this.getMovieDetails(watchedMovie.id);
    
    // 시청 이력 추가
    profile.watchHistory.push({
      movieId: watchedMovie.id,
      title: watchedMovie.title,
      genres: movieDetails.genres.map((g: any) => g.id),
      cast: movieDetails.cast.slice(0, 5).map((c: any) => c.id),
      directors: movieDetails.directors.map((d: any) => d.id),
      releaseYear: new Date(watchedMovie.release_date).getFullYear(),
      runtime: movieDetails.runtime,
      tmdbRating: watchedMovie.vote_average,
      watchedAt: new Date(),
      userRating,
      rewatched: false
    });

    // 선호도 업데이트
    await this.updatePreferences(profile, movieDetails, userRating);
    
    profile.updatedAt = new Date();
    this.userProfiles.set(userId, profile);

    // 유사 사용자 재계산 (비동기)
    this.calculateUserSimilarities(userId);
  }

  /**
   * 하이브리드 추천 생성
   */
  async generateRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const { userId, count, algorithms, filters } = request;
    
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    let recommendations: RecommendationScore[] = [];

    // 각 알고리즘별 추천 생성
    for (const algorithm of algorithms) {
      let algorithmRecommendations: RecommendationScore[] = [];

      switch (algorithm) {
        case 'collaborative':
          algorithmRecommendations = await this.collaborativeFiltering(userId, count);
          break;
        case 'content':
          algorithmRecommendations = await this.contentBasedFiltering(userId, count);
          break;
        case 'hybrid':
          algorithmRecommendations = await this.hybridRecommendation(userId, count);
          break;
      }

      recommendations = [...recommendations, ...algorithmRecommendations];
    }

    // 중복 제거 및 점수 정규화
    recommendations = this.deduplicateAndNormalize(recommendations);

    // 필터 적용
    if (filters) {
      recommendations = await this.applyFilters(recommendations, filters, profile);
    }

    // 상위 N개 선택
    recommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    // 영화 상세 정보와 함께 반환
    const enhancedRecommendations = await this.enhanceRecommendations(recommendations);

    return {
      userId,
      recommendations: enhancedRecommendations,
      algorithm: algorithms.join('+'),
      generatedAt: new Date(),
      confidence: this.calculateOverallConfidence(recommendations)
    };
  }

  /**
   * 협업 필터링 (Collaborative Filtering)
   * 유사한 취향의 사용자들이 좋아한 영화 추천
   */
  private async collaborativeFiltering(userId: string, count: number): Promise<RecommendationScore[]> {
    const similarUsers = this.userSimilarities.get(userId) || [];
    const userProfile = this.userProfiles.get(userId)!;
    const userWatchedMovies = new Set(userProfile.watchHistory.map(m => m.movieId));

    const movieScores = new Map<number, { score: number; voters: number; reasons: RecommendationReason[] }>();

    // 유사 사용자들의 영화 평점 분석
    for (const similarUser of similarUsers.slice(0, 10)) { // 상위 10명만 사용
      const similarProfile = this.userProfiles.get(similarUser.userId);
      if (!similarProfile) continue;

      for (const movie of similarProfile.watchHistory) {
        if (userWatchedMovies.has(movie.movieId)) continue; // 이미 본 영화 제외

        const userRating = movie.userRating || this.estimateRating(movie);
        const weightedScore = userRating * similarUser.similarity;

        const existing = movieScores.get(movie.movieId);
        if (existing) {
          existing.score += weightedScore;
          existing.voters += 1;
        } else {
          movieScores.set(movie.movieId, {
            score: weightedScore,
            voters: 1,
            reasons: [{
              type: 'similar_users',
              description: `취향이 비슷한 사용자들이 좋아한 영화입니다`,
              confidence: similarUser.similarity
            }]
          });
        }
      }
    }

    // 점수 정규화 및 신뢰도 계산
    return Array.from(movieScores.entries())
      .map(([movieId, data]) => ({
        movieId,
        score: data.score / data.voters, // 평균 점수
        reasons: data.reasons,
        algorithm: 'collaborative' as const
      }))
      .filter(rec => rec.score > 3.0) // 최소 점수 필터
      .sort((a, b) => b.score - a.score)
      .slice(0, count * 2); // 여유분 확보
  }

  /**
   * 콘텐츠 기반 필터링 (Content-Based Filtering)
   * 사용자가 좋아한 영화의 특성과 유사한 영화 추천
   */
  private async contentBasedFiltering(userId: string, count: number): Promise<RecommendationScore[]> {
    const userProfile = this.userProfiles.get(userId)!;
    const userWatchedMovies = new Set(userProfile.watchHistory.map(m => m.movieId));

    // 사용자 선호 프로필 생성
    const preferenceVector = this.createPreferenceVector(userProfile);

    // TMDB에서 인기 영화 가져오기
    const candidateMovies = await this.getCandidateMovies(1000);

    const recommendations: RecommendationScore[] = [];

    for (const movie of candidateMovies) {
      if (userWatchedMovies.has(movie.id)) continue;

      // 영화 특성 벡터 생성
      const movieVector = await this.createMovieVector(movie);
      
      // 코사인 유사도 계산
      const similarity = this.calculateCosineSimilarity(preferenceVector, movieVector);
      
      if (similarity > 0.3) { // 최소 유사도 기준
        const reasons: RecommendationReason[] = [];
        
        // 유사성 이유 분석
        if (preferenceVector.genres && movieVector.genres) {
          const genreMatch = this.findGenreMatches(preferenceVector.genres, movieVector.genres);
          if (genreMatch.length > 0) {
            reasons.push({
              type: 'genre',
              description: `좋아하시는 ${genreMatch.join(', ')} 장르와 일치합니다`,
              confidence: 0.8
            });
          }
        }

        recommendations.push({
          movieId: movie.id,
          score: similarity * 5, // 5점 척도로 변환
          reasons,
          algorithm: 'content'
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count * 2);
  }

  /**
   * 하이브리드 추천 (Collaborative + Content-Based)
   */
  private async hybridRecommendation(userId: string, count: number): Promise<RecommendationScore[]> {
    const [collaborative, contentBased] = await Promise.all([
      this.collaborativeFiltering(userId, count),
      this.contentBasedFiltering(userId, count)
    ]);

    // 가중 평균으로 점수 결합
    const collaborativeWeight = 0.6;
    const contentWeight = 0.4;

    const movieScores = new Map<number, RecommendationScore>();

    // 협업 필터링 결과 처리
    for (const rec of collaborative) {
      movieScores.set(rec.movieId, {
        ...rec,
        score: rec.score * collaborativeWeight,
        algorithm: 'hybrid'
      });
    }

    // 콘텐츠 기반 결과 병합
    for (const rec of contentBased) {
      const existing = movieScores.get(rec.movieId);
      if (existing) {
        existing.score += rec.score * contentWeight;
        existing.reasons = [...existing.reasons, ...rec.reasons];
      } else {
        movieScores.set(rec.movieId, {
          ...rec,
          score: rec.score * contentWeight,
          algorithm: 'hybrid'
        });
      }
    }

    return Array.from(movieScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, count * 2);
  }

  /**
   * 사용자 간 유사도 계산
   */
  private async calculateUserSimilarities(userId: string): Promise<void> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return;

    const similarities: SimilarUser[] = [];

    for (const [otherUserId, otherProfile] of this.userProfiles) {
      if (userId === otherUserId) continue;

      const similarity = this.calculateUserSimilarity(userProfile, otherProfile);
      const commonMovies = this.countCommonMovies(userProfile, otherProfile);

      if (similarity > 0.1 && commonMovies >= 3) { // 최소 기준
        similarities.push({
          userId: otherUserId,
          similarity,
          commonMovies
        });
      }
    }

    // 유사도 순으로 정렬
    similarities.sort((a, b) => b.similarity - a.similarity);
    this.userSimilarities.set(userId, similarities.slice(0, 50)); // 상위 50명만 저장
  }

  /**
   * 실시간 추천 업데이트
   */
  async updateRecommendationsRealtime(userId: string): Promise<void> {
    // 사용자 프로필 업데이트
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // 최근 활동 기반으로 가중치 조정
    await this.adjustPreferencesBasedOnRecentActivity(profile);
    
    // 유사 사용자 재계산
    await this.calculateUserSimilarities(userId);
    
    // 캐시된 추천 무효화
    await this.invalidateRecommendationCache(userId);
  }

  // Helper Methods
  private createNewUserProfile(userId: string): UserProfile {
    return {
      userId,
      preferences: {
        genres: {},
        actors: {},
        directors: {},
        releaseYears: {},
        runtimeRange: { min: 60, max: 180 },
        ratingThreshold: 6.0
      },
      watchHistory: [],
      ratings: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async getMovieDetails(movieId: number): Promise<any> {
    const [movieResponse, creditsResponse] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.API_KEY}&language=ko-KR`),
      fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${this.API_KEY}`)
    ]);

    const movie = await movieResponse.json();
    const credits = await creditsResponse.json();

    return {
      ...movie,
      cast: credits.cast || [],
      directors: credits.crew?.filter((c: any) => c.job === 'Director') || []
    };
  }

  private async updatePreferences(profile: UserProfile, movieDetails: any, userRating?: number): Promise<void> {
    const weight = userRating ? userRating / 5 : 0.7; // 평점이 없으면 기본 가중치

    // 장르 선호도 업데이트
    for (const genre of movieDetails.genres) {
      profile.preferences.genres[genre.id] = 
        (profile.preferences.genres[genre.id] || 0) + weight;
    }

    // 배우 선호도 업데이트
    for (const actor of movieDetails.cast.slice(0, 5)) {
      profile.preferences.actors[actor.id] = 
        (profile.preferences.actors[actor.id] || 0) + weight * 0.5;
    }

    // 감독 선호도 업데이트
    for (const director of movieDetails.directors) {
      profile.preferences.directors[director.id] = 
        (profile.preferences.directors[director.id] || 0) + weight * 0.8;
    }

    // 연도 선호도 업데이트
    const year = new Date(movieDetails.release_date).getFullYear();
    profile.preferences.releaseYears[year] = 
      (profile.preferences.releaseYears[year] || 0) + weight * 0.3;
  }

  private calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    // Pearson 상관계수 기반 유사도 계산
    const commonMovies = this.getCommonMovies(user1, user2);
    if (commonMovies.length < 3) return 0;

    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    for (const movieId of commonMovies) {
      const rating1 = this.getUserRatingForMovie(user1, movieId);
      const rating2 = this.getUserRatingForMovie(user2, movieId);

      sum1 += rating1;
      sum2 += rating2;
      sum1Sq += rating1 * rating1;
      sum2Sq += rating2 * rating2;
      pSum += rating1 * rating2;
    }

    const num = pSum - (sum1 * sum2 / commonMovies.length);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / commonMovies.length) * 
                         (sum2Sq - sum2 * sum2 / commonMovies.length));

    if (den === 0) return 0;
    return Math.max(0, num / den); // 음수는 0으로 처리
  }

  private calculateCosineSimilarity(vector1: any, vector2: any): number {
    // 코사인 유사도 계산 구현
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const allKeys = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);

    for (const key of allKeys) {
      const val1 = vector1[key] || 0;
      const val2 = vector2[key] || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private async getCandidateMovies(limit: number): Promise<any[]> {
    const movies: any[] = [];
    const pages = Math.ceil(limit / 20);

    for (let page = 1; page <= pages; page++) {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${this.API_KEY}&language=ko-KR&sort_by=popularity.desc&page=${page}&vote_average.gte=6.0`
      );
      const data = await response.json();
      movies.push(...(data.results || []));
    }

    return movies.slice(0, limit);
  }

  private createPreferenceVector(profile: UserProfile): any {
    return {
      genres: profile.preferences.genres,
      // 다른 특성들도 추가 가능
    };
  }

  private async createMovieVector(movie: any): Promise<any> {
    const vector: any = { genres: {} };
    
    // 장르 벡터 생성
    if (movie.genre_ids) {
      for (const genreId of movie.genre_ids) {
        vector.genres[genreId] = 1;
      }
    }

    return vector;
  }

  private findGenreMatches(userGenres: any, movieGenres: any): string[] {
    const genreNames: { [key: number]: string } = {
      28: '액션', 35: '코미디', 18: '드라마', 27: '공포', 
      10749: '로맨스', 878: 'SF', 53: '스릴러', 16: '애니메이션'
    };

    const matches: string[] = [];
    for (const genreId in movieGenres) {
      if (userGenres[genreId] && userGenres[genreId] > 0.5) {
        matches.push(genreNames[parseInt(genreId)] || `장르${genreId}`);
      }
    }
    return matches;
  }

  private deduplicateAndNormalize(recommendations: RecommendationScore[]): RecommendationScore[] {
    const movieMap = new Map<number, RecommendationScore>();
    
    for (const rec of recommendations) {
      const existing = movieMap.get(rec.movieId);
      if (!existing || rec.score > existing.score) {
        movieMap.set(rec.movieId, rec);
      }
    }

    return Array.from(movieMap.values());
  }

  private async enhanceRecommendations(recommendations: RecommendationScore[]): Promise<EnhancedMovieRecommendation[]> {
    const enhanced: EnhancedMovieRecommendation[] = [];

    for (const rec of recommendations) {
      try {
        const movieDetails = await this.getMovieDetails(rec.movieId);
        
        enhanced.push({
          id: rec.movieId,
          title: movieDetails.title,
          poster_path: movieDetails.poster_path,
          vote_average: movieDetails.vote_average,
          release_date: movieDetails.release_date,
          overview: movieDetails.overview,
          genres: movieDetails.genres || [],
          cast: movieDetails.cast?.slice(0, 5) || [],
          directors: movieDetails.directors || [],
          score: rec.score,
          reasons: rec.reasons,
          confidence: Math.min(rec.score / 5, 1),
          algorithm: rec.algorithm
        });
      } catch (error) {
        console.error(`Failed to enhance recommendation for movie ${rec.movieId}:`, error);
      }
    }

    return enhanced;
  }

  // 추가 헬퍼 메서드들...
  private estimateRating(movie: any): number {
    return Math.min(5, Math.max(1, movie.tmdbRating / 2));
  }

  private getCommonMovies(user1: UserProfile, user2: UserProfile): number[] {
    const movies1 = new Set(user1.watchHistory.map(m => m.movieId));
    const movies2 = new Set(user2.watchHistory.map(m => m.movieId));
    return Array.from(movies1).filter(id => movies2.has(id));
  }

  private countCommonMovies(user1: UserProfile, user2: UserProfile): number {
    return this.getCommonMovies(user1, user2).length;
  }

  private getUserRatingForMovie(user: UserProfile, movieId: number): number {
    const movie = user.watchHistory.find(m => m.movieId === movieId);
    return movie?.userRating || this.estimateRating(movie || { tmdbRating: 7.0 });
  }

  private calculateOverallConfidence(recommendations: RecommendationScore[]): number {
    if (recommendations.length === 0) return 0;
    const avgScore = recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length;
    return Math.min(avgScore / 5, 1);
  }

  private async applyFilters(recommendations: RecommendationScore[], filters: any, profile: UserProfile): Promise<RecommendationScore[]> {
    // 필터 적용 로직 구현
    let filtered = recommendations;

    if (filters.minRating) {
      // TMDB에서 실제 평점 확인 후 필터링 (간단화)
      filtered = filtered.filter(rec => rec.score >= filters.minRating);
    }

    if (filters.excludeWatched && profile.watchHistory) {
      const watchedIds = new Set(profile.watchHistory.map(m => m.movieId));
      filtered = filtered.filter(rec => !watchedIds.has(rec.movieId));
    }

    return filtered;
  }

  private async adjustPreferencesBasedOnRecentActivity(profile: UserProfile): Promise<void> {
    // 최근 30일간의 활동에 더 높은 가중치 부여
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMovies = profile.watchHistory.filter(
      m => m.watchedAt > thirtyDaysAgo
    );

    // 최근 시청한 영화의 장르에 보너스 가중치
    for (const movie of recentMovies) {
      for (const genreId of movie.genres) {
        profile.preferences.genres[genreId] = 
          (profile.preferences.genres[genreId] || 0) + 0.1;
      }
    }
  }

  private async invalidateRecommendationCache(userId: string): Promise<void> {
    // 실제 구현에서는 Redis 등의 캐시에서 해당 사용자의 추천 캐시 삭제
    // console.log(`Invalidating recommendation cache for user: ${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }
}

// 전역 추천 엔진 인스턴스
export const recommendationEngine = new MovieRecommendationEngine();
