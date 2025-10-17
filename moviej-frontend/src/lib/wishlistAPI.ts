import { api } from "./api";

export interface WishlistItem {
  id: number;
  movieId: number;
  title: string;
  posterPath: string;
  createdAt: string;
  rating: number;
}

export interface WishlistRequest {
  movieId: number;
  title: string;
  posterPath: string;
}

export interface WishlistCheckResponse {
  isInWishlist: boolean;
}

/**
 * 찜 목록 조회
 */
export async function getWishlist(email: string): Promise<WishlistItem[]> {
  const response = await api.get("/wishlist", {
    params: { email }
  });
  return response.data;
}

/**
 * 찜 추가
 */
export async function addToWishlist(email: string, data: WishlistRequest): Promise<WishlistRequest> {
  const response = await api.post("/wishlist", data, {
    params: { email }
  });
  return response.data;
}

/**
 * 찜 토글 (있으면 삭제, 없으면 추가)
 */
export async function toggleWishlist(email: string, data: WishlistRequest): Promise<WishlistRequest> {
  const response = await api.post("/wishlist/toggle", data, {
    params: { email }
  });
  return response.data;
}

/**
 * 찜 여부 확인
 */
export async function checkWishlist(email: string, movieId: number): Promise<boolean> {
  const response = await api.get(`/wishlist/check/${movieId}`, {
    params: { email }
  });
  // 백엔드 응답이 additionalProp 형태이므로 첫 번째 값 확인
  const data = response.data;
  return Object.values(data)[0] as boolean || false;
}

/**
 * 찜 삭제
 */
export async function removeFromWishlist(email: string, movieId: number): Promise<void> {
  await api.delete(`/wishlist/${movieId}`, {
    params: { email }
  });
}
