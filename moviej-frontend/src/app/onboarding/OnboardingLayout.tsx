"use client";
import StepIndicator from "./StepIndicator";
import { useEffect } from "react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingLayout({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
    useEffect(() => {
        const preventGoBack = () => {
            history.pushState(null, "", location.href);
        };
      
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", preventGoBack);

        return () => {
            window.removeEventListener("popstate", preventGoBack);
        }
    }, [])

  return (
    <div className="min-h-screen flex mt-10 justify-center p-4">
      <div className="max-w-4xl w-full p-8 md:p-12">
        {/* 단계 표시기 */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        {/* 메인 콘텐츠 */}
        <div className="mt-8">
          {children}
        </div>

      </div>
    </div>
  );
}
