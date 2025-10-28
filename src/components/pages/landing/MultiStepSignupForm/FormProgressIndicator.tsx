'use client';

import { Check } from 'lucide-react';

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  furthestStep: number;
  onStepClick: (step: number) => void;
}

export function FormProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  furthestStep,
  onStepClick,
}: FormProgressIndicatorProps) {
  return (
    <>
      {/* Mobile: Horizontal progress bar at top */}
      <div className="lg:hidden sticky top-0 z-[60] rounded-t-3xl bg-white/95 p-4 shadow-sm backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
        <div className="flex h-2 w-full gap-1">
          {Array.from({ length: totalSteps }, (_, index) => {
            const isFilled = index < currentStep;
            return (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  isFilled ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop: Vertical progress indicator (parent is fixed) */}
      <div className="hidden lg:block bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-6">Your Progress</h3>
        <div className="space-y-4 relative">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isBetween = stepNumber > currentStep && stepNumber < furthestStep;
            const isFurthest = stepNumber === furthestStep && stepNumber > currentStep;
            const isClickable = stepNumber <= furthestStep && stepNumber !== currentStep;

            return (
              <div key={index} className="relative">
                <div
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  className={`flex items-start gap-3 -mx-2 px-2 py-1 rounded-lg ${isClickable ? 'cursor-pointer hover:bg-primary/10' : 'cursor-default'} transition-all`}
                >
                  {/* Circle indicator */}
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all
                      ${
                        isCompleted
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isCurrent
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : isBetween
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isFurthest
                          ? 'bg-blue-600/50 border-blue-600/50 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{stepNumber}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="pt-2">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent
                          ? 'text-foreground'
                          : isCompleted || isBetween
                          ? 'text-muted-foreground'
                          : isFurthest
                          ? 'text-muted-foreground'
                          : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                </div>

                {/* Connecting line */}
                {index < stepLabels.length - 1 && (
                  <div
                    className={`
                      absolute left-5 w-0.5 h-8 top-10 -z-10 transition-all
                      ${isCompleted || isBetween ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
