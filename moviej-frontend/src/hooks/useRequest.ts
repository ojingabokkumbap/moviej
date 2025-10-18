/**
 * useRequest - 현업에서 많이 사용하는 API 요청 커스텀 훅
 * 
 * 🎯 목적: 
 * - API 요청의 공통 로직을 재사용 가능하게 만듦
 * - 로딩 상태, 에러 처리를 자동으로 관리
 * - 모든 컴포넌트에서 일관된 API 호출 패턴 제공
 */

import { useState, useCallback } from 'react';
import { api } from "@/lib/api";

/**
 * 요청 상태를 나타내는 타입 정의
 * T: 응답 데이터의 타입 (제네릭)
 */
interface RequestState<T = unknown> {
  data: T | null;           // 응답 데이터 (성공 시)
  isLoading: boolean;       // 로딩 상태 (true: 요청 중, false: 완료)
  isError: boolean;         // 에러 상태 (true: 에러 발생, false: 정상)
  errorMessage: string | null; // 에러 메시지 (에러 발생 시)
}

/**
 * HTTP 메서드 타입 정의
 * 현업에서 자주 사용하는 메서드들만 포함
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * useRequest 커스텀 훅
 * 
 * @returns {object} API 요청 관련 상태와 함수들
 */
// useRequest 훅은 제네릭을 함수 레벨에서만 사용합니다. (상태는 any로 관리)
export function useRequest() {
  // 📋 상태 관리: 모든 API 요청의 공통 상태들을 하나의 객체로 관리
  const [state, setState] = useState<RequestState<any>>({
    data: null,              // 초기값: 데이터 없음
    isLoading: false,        // 초기값: 로딩 중 아님
    isError: false,          // 초기값: 에러 없음
    errorMessage: null,      // 초기값: 에러 메시지 없음
  });

  /**
   * 🚀 메인 요청 실행 함수
   * 
   * useCallback: 함수를 메모이제이션해서 불필요한 리렌더링 방지
   * - 의존성 배열이 빈 배열이므로 컴포넌트가 마운트될 때 한 번만 생성
   * 
   * @param method - HTTP 메서드 (GET, POST, PUT, PATCH, DELETE)
   * @param url - 요청할 URL (예: '/api/posts')
   * @param payload - 요청 시 보낼 데이터 (POST, PUT, PATCH에서 사용)
   * @returns Promise<T> - 응답 데이터
   */
  /**
   * executeRequest - 모든 HTTP 요청의 핵심 실행 함수
   * - 요청 전: 로딩 상태 true, 에러 초기화
   * - 요청 성공: data, isLoading, isError, errorMessage 모두 최신화
   * - 요청 실패: 에러 메시지, isError, isLoading 모두 최신화
   * - 항상 응답 데이터를 반환 (Promise)
   */
  /**
   * executeRequest - 모든 HTTP 요청의 핵심 실행 함수 (제네릭)
   * - 각 요청 함수에서 타입을 지정해주면 타입 안전하게 사용 가능
   * - 상태는 any로 관리하므로 여러 타입의 요청을 한 컴포넌트에서 동시에 써도 안전
   */
  const executeRequest = useCallback(
    async <T = any>(
      method: HttpMethod,
      url: string,
      payload?: Record<string, unknown>
    ): Promise<T> => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        isError: false,
        errorMessage: null,
      }));

      try {
        const response = await api({
          method: method.toLowerCase(),
          url,
          data: payload,
        });
        // 서버에서 내려주는 표준화된 에러/성공 구조도 지원 가능
        // 예: { success: true, data: {...} } 형태라면 아래처럼 분기 가능
        // const result = response.data?.data ?? response.data;
        const result = response.data;

        setState(prev => ({
          ...prev,
          data: result,
          isLoading: false,
          isError: false,
          errorMessage: null,
        }));

        return result as T;
      } catch (error: any) {
        let message = 'Request failed';
        if (error?.response?.data?.message) {
          message = error.response.data.message;
        } else if (error?.message) {
          message = error.message;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isError: true,
          errorMessage: message,
        }));
        throw error;
      }
    },
    []
  );

  // 🛠️ 편의 함수들: 각 HTTP 메서드별로 쉽게 사용할 수 있는 함수들
  
  /**
   * GET 요청 (데이터 조회)
   * @param url - 요청할 URL
   */
  // 각 요청 함수에만 제네릭 선언! (상태는 any로 관리)
  /**
   * GET 요청 (데이터 조회)
   * @param url - 요청할 URL
   */
  const get = useCallback(<T = any>(url: string) =>
    executeRequest<T>('GET', url), [executeRequest]);

  /**
   * POST 요청 (데이터 생성)
   * @param url - 요청할 URL
   * @param data - 생성할 데이터
   */
  const post = useCallback(<T = any>(url: string, data?: Record<string, unknown>) =>
    executeRequest<T>('POST', url, data), [executeRequest]);

  /**
   * PUT 요청 (데이터 전체 수정)
   * @param url - 요청할 URL
   * @param data - 수정할 데이터
   */
  const put = useCallback(<T = any>(url: string, data: Record<string, unknown>) =>
    executeRequest<T>('PUT', url, data), [executeRequest]);

  /**
   * PATCH 요청 (데이터 부분 수정)
   * @param url - 요청할 URL
   * @param data - 수정할 부분 데이터
   */
  const patch = useCallback(<T = any>(url: string, data: Record<string, unknown>) =>
    executeRequest<T>('PATCH', url, data), [executeRequest]);

  /**
   * DELETE 요청 (데이터 삭제)
   * @param url - 요청할 URL
   */
  const remove = useCallback(<T = any>(url: string) =>
    executeRequest<T>('DELETE', url), [executeRequest]);

  // 📤 반환값: 컴포넌트에서 사용할 상태와 함수들
  return {
    // 상태값들 (구조분해할당으로 개별 접근 가능)
    ...state,                    // data, isLoading, isError, errorMessage
    
    // 함수들
    executeRequest,              // 직접 요청 실행 (고급 사용)
    get,                        // GET 요청
    post,                       // POST 요청  
    put,                        // PUT 요청
    patch,                      // PATCH 요청
    remove,                     // DELETE 요청
    
    // 편의 속성들 (계산된 값)
    isIdle: !state.isLoading && !state.isError && !state.data,  // 아무것도 안 한 상태
    isSuccess: !state.isLoading && !state.isError && !!state.data, // 성공 상태
  };
}

/**
 * 🎯 사용 예시:
 * 
 * function MyComponent() {
 *   const { isLoading, isError, errorMessage, data, get, post } = useRequest();
 * 
 *   const fetchData = async () => {
 *     try {
 *       await get('/api/posts');
 *       // 성공 시 data에 자동으로 저장됨
 *     } catch (error) {
 *       // 에러 처리 (errorMessage에 자동으로 저장됨)
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {isLoading && <div>로딩 중...</div>}
 *       {isError && <div>에러: {errorMessage}</div>}
 *       {data && <div>데이터: {JSON.stringify(data)}</div>}
 *     </div>
 *   );
 * }
 */
