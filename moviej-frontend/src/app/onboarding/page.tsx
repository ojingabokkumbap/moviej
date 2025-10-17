"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useNotification } from "@/contexts/NotificationContext";
import OnboardingLayout from "./OnboardingLayout";
import Step1Genre from "./Step1Genre";
import Step2Actors from "./Step2Actors";
import Step3Movies from "./Step3Movies";

export default function OnboardingPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    genres: [],
    actors: [],
    movies: [],
    movieRatings: {}
  });

  // 페이지 타이틀 설정
  useEffect(() => {
    document.title = "취향 분석 - MovieJ";
  }, []);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // 마지막 단계에서 완료
      handleComplete();
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleDataUpdate = useCallback((stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  const handleComplete = async () => {
    try {
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        showNotification("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.", "error");
        router.push("/");
        return;
      }

      // 백엔드 API 형식에 맞게 데이터 변환
      const requestData = {
        genres: formData.genres.map((genre: any) => ({
          genreId: genre.tmdbId || null,
          genreName: genre.name || null
        })),
        actors: formData.actors.map((actor: any) => {
          // TMDB ID가 숫자인 경우 그대로 사용, 아니면 null
          let actorId = null;
          if (typeof actor.id === 'number') {
            actorId = actor.id;
          } else if (typeof actor.id === 'string' && !actor.id.startsWith('local_')) {
            const parsed = parseInt(actor.id);
            actorId = isNaN(parsed) ? null : parsed;
          }
          return {
            actorId: actorId,
            actorName: actor.name || null
          };
        }),
        movies: formData.movies.map((movie: any) => {
          // TMDB movie ID를 정수로 변환
          let movieId = null;
          if (typeof movie.id === 'number') {
            movieId = movie.id;
          } else if (typeof movie.id === 'string' && !movie.id.startsWith('local_')) {
            const parsed = parseInt(movie.id);
            movieId = isNaN(parsed) ? null : parsed;
          }
          return {
            tmdbId: movieId,
            title: movie.title || null
          };
        })
      };

      // 백엔드로 온보딩 데이터 전송
      const response = await api.post(`/users/${userId}/preferences`, requestData);

      if (response.status === 200 || response.status === 201) {
        // 선호도 데이터를 로컬스토리지에도 저장 (프로필 페이지에서 사용)
        localStorage.setItem("userPreferences", JSON.stringify(requestData));
        
        showNotification("취향 분석이 완료되었습니다!", "success");
        // 홈으로 이동
        router.push("/home");
      }
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message || "설정 저장 중 오류가 발생했습니다.",
        "error"
      );
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1: 
        return (
          <Step1Genre 
            onNext={handleNext} 
            onDataUpdate={handleDataUpdate} 
            data={formData} 
          />
        );
      case 2: 
        return (
          <Step2Actors 
            onNext={handleNext} 
            onPrev={handlePrev}
            onDataUpdate={handleDataUpdate} 
            data={formData} 
          />
        );
      case 3: 
        return (
          <Step3Movies 
            onNext={handleNext} 
            onPrev={handlePrev}
            onDataUpdate={handleDataUpdate} 
            data={formData} 
          />
        );
      default: 
        return null;
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={3}>
      {renderStep()}
    </OnboardingLayout>
  );
}