'use client';

import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '../index';
import { Sprout, BookOpen, Trophy, Check } from 'lucide-react';

interface ExperienceStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

const experienceLevels = [
  {
    value: 'beginner' as const,
    label: 'Beginner',
    description: 'New to working out or getting back after a break',
    icon: Sprout,
  },
  {
    value: 'intermediate' as const,
    label: 'Intermediate',
    description: '1-2 years of consistent training',
    icon: BookOpen,
  },
  {
    value: 'advanced' as const,
    label: 'Advanced',
    description: '3+ years of consistent training',
    icon: Trophy,
  },
];

export function ExperienceStep({ setValue, watch, errors }: ExperienceStepProps) {
  const selectedLevel = watch('experienceLevel');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          What&apos;s your experience level?
        </h2>
        <p className="text-muted-foreground">
          This helps us set the right difficulty and progression for you.
        </p>
      </div>

      {/* Experience Options */}
      <div className="space-y-4">
        {experienceLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedLevel === level.value;

          return (
            <button
              key={level.value}
              type="button"
              onClick={() => setValue('experienceLevel', level.value)}
              className={`
                w-full p-6 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-white hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-muted text-muted-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{level.label}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected ? 'bg-primary border-2 border-primary' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {errors.experienceLevel && (
        <p className="text-sm text-destructive">{errors.experienceLevel.message}</p>
      )}
    </div>
  );
}
