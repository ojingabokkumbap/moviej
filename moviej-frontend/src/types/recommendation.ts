// 추천 시스템 관련 타입 정의

export interface UserProfile {
  userId: string;
  preferences: {
    genres: { [genreId: number]: number }; // 장르별 선호도 점수
    actors: { [actorId: number]: number }; // 배우별 선호도 점수
    directors: { [directorId: number]: number }; // 감독별 선호도 점수
    releaseYears: { [year: number]: number }; // 연도별 선호도
    runtimeRange: { min: number; max: number }; // 선호 상영시간
    ratingThreshold: number; // 최소 평점 기준
  };
  watchHistory: WatchedMovie[];
  ratings: UserRating[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchedMovie {
  movieId: number;
  title: string;
  genres: number[];
  cast: number[];
  directors: number[];
  releaseYear: number;
  runtime: number;
  tmdbRating: number;
  watchedAt: Date;
  userRating?: number;
  rewatched: boolean;
}

export interface UserRating {
  movieId: number;
  rating: number;
  timestamp: Date;
  review?: string;
}

export interface MovieFeatures {
  id: number;
  title: string;
  genres: number[];
  cast: number[];
  directors: number[];
  releaseYear: number;
  runtime: number;
  tmdbRating: number;
  popularity: number;
  voteCount: number;
  keywords: number[];
  overview: string;
}

export interface RecommendationScore {
  movieId: number;
  score: number;
  reasons: RecommendationReason[];
  algorithm: 'collaborative' | 'content' | 'hybrid';
}

export interface RecommendationReason {
  type: 'genre' | 'actor' | 'director' | 'similar_users' | 'rating' | 'trending';
  description: string;
  confidence: number;
}

export interface SimilarUser {
  userId: string;
  similarity: number;
  commonMovies: number;
}

export interface RecommendationRequest {
  userId: string;
  count: number;
  algorithms: ('collaborative' | 'content' | 'hybrid')[];
  filters?: {
    genres?: number[];
    minRating?: number;
    releaseYearRange?: { start: number; end: number };
    excludeWatched?: boolean;
  };
}

export interface RecommendationResponse {
  userId: string;
  recommendations: EnhancedMovieRecommendation[];
  algorithm: string;
  generatedAt: Date;
  confidence: number;
}

export interface EnhancedMovieRecommendation {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
  genres: { id: number; name: string }[];
  cast: { id: number; name: string; profile_path: string }[];
  directors: { id: number; name: string }[];
  score: number;
  reasons: RecommendationReason[];
  confidence: number;
  algorithm: string;
}
