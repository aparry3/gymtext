'use client';

import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '../index';
import { Dumbbell, Heart, TrendingDown, Activity } from 'lucide-react';

interface GoalsStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

const goals = [
  {
    value: 'strength' as const,
    label: 'Get Stronger',
    description: 'Build muscle and increase strength',
    icon: Dumbbell,
  },
  {
    value: 'endurance' as const,
    label: 'Build Endurance',
    description: 'Improve cardiovascular fitness',
    icon: Heart,
  },
  {
    value: 'weight_loss' as const,
    label: 'Lose Weight',
    description: 'Improve body composition',
    icon: TrendingDown,
  },
  {
    value: 'general_fitness' as const,
    label: 'General Fitness',
    description: 'Overall health and wellness',
    icon: Activity,
  },
];

export function GoalsStep({ setValue, watch, errors }: GoalsStepProps) {
  const selectedGoal = watch('primaryGoal');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          What&apos;s your primary goal?
        </h2>
        <p className="text-muted-foreground">
          This helps us create a program that&apos;s right for you.
        </p>
      </div>

      {/* Goal Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal === goal.value;

          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => setValue('primaryGoal', goal.value)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-white hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{goal.label}</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {errors.primaryGoal && (
        <p className="text-sm text-destructive">{errors.primaryGoal.message}</p>
      )}
    </div>
  );
}
