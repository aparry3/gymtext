'use client';

import { Check } from 'lucide-react';

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function FormProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: FormProgressIndicatorProps) {
  return (
    <>
      {/* Mobile: Horizontal progress bar at top */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
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

            return (
              <div key={index} className="flex items-start gap-3 relative">
                {/* Circle indicator */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all
                    ${
                      isCompleted
                        ? 'bg-primary border-primary text-white'
                        : isCurrent
                        ? 'bg-white border-primary text-primary animate-pulse'
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
                        : isCompleted
                        ? 'text-muted-foreground'
                        : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </p>
                </div>

                {/* Connecting line */}
                {index < stepLabels.length - 1 && (
                  <div
                    className={`
                      absolute left-5 w-0.5 h-8 top-10 transition-all
                      ${isCompleted ? 'bg-primary' : 'bg-gray-300'}
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
