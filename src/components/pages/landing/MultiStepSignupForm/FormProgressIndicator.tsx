'use client';

import { Check } from 'lucide-react';

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  furthestStep: number;
  onStepClick: (step: number) => void;
  variant?: 'mobile' | 'desktop' | 'both';
}

export function FormProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  furthestStep,
  onStepClick,
  variant = 'both',
}: FormProgressIndicatorProps) {
  const showMobile = variant === 'mobile' || variant === 'both';
  const showDesktop = variant === 'desktop' || variant === 'both';

  return (
    <>
      {/* Mobile: Horizontal progress bar at top */}
      {showMobile && (
        <div className="sticky top-0 z-[60] rounded-t-3xl bg-white/95 p-4 shadow-sm backdrop-blur-sm md:hidden">
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
      )}

      {/* Desktop: Vertical progress indicator (parent is fixed) */}
      {showDesktop && (
        <div className="hidden lg:block rounded-3xl bg-white/95 p-6">
          <h3 className="mb-6 text-sm font-semibold text-foreground">Your Progress</h3>
          <div className="relative space-y-4">
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
                    className={`-mx-2 flex items-start gap-3 rounded-lg px-2 py-1 ${
                      isClickable ? 'cursor-pointer hover:bg-primary/10' : 'cursor-default'
                    } transition-all`}
                  >
                    {/* Circle indicator */}
                    <div
                      className={`
                        flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                        ${
                          isCompleted
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isCurrent
                            ? 'border-orange-500 bg-orange-500 text-white'
                            : isBetween
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : isFurthest
                            ? 'border-blue-600/50 bg-blue-600/50 text-white'
                            : 'border-gray-300 bg-white text-gray-400'
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
                        absolute left-5 top-10 h-8 w-0.5 -z-10 transition-all
                        ${isCompleted || isBetween ? 'bg-blue-600' : 'bg-gray-300'}
                      `}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
