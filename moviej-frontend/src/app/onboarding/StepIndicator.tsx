"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8 relative">
     {/*  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center z-10">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
            ${step <= currentStep 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-500'}
          `}>
            {step <= currentStep ? (
              step < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div className={`
              w-16 mx-2 transition-all 
              ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
          <div className="h-1 bg-gray-200 w-52 absolute left-1/2 transform -translate-x-1/2 -z-1 " />
        </div>
      ))} */}
    </div>
  );
}
