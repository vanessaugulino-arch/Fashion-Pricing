import React from 'react';

interface FlowProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function FlowProgress({ currentStep, totalSteps }: FlowProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="text-sm font-sans text-gray-500 mb-2">
        Passo {currentStep} de {totalSteps}
      </div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#2F1B20] transition-all duration-400 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}