"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "./OnboardingLayout";
import Step1Genre from "./Step1Genre";
import Step2Actors from "./Step2Actors";
import Step3Movies from "./Step3Movies";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    genres: [],
    actors: [],
    movies: [],
    movieRatings: {}
  });

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
      localStorage.setItem('userPreferences', JSON.stringify(formData));
      
      // 메인 페이지로 이동
      router.push('/');
    } catch (error) {
      console.error("온보딩 완료 중 오류:", error);
      alert("설정 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
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