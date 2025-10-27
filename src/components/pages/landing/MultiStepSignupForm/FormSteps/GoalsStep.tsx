'use client';

import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '../index';
import { Dumbbell, Heart, TrendingDown, Activity, Check } from 'lucide-react';

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

export function GoalsStep({ register, setValue, watch, errors }: GoalsStepProps) {
  const selectedGoals = watch('primaryGoals') || [];

  const toggleGoal = (value: 'strength' | 'endurance' | 'weight_loss' | 'general_fitness') => {
    const current = selectedGoals || [];
    if (current.includes(value)) {
      setValue(
        'primaryGoals',
        current.filter((item) => item !== value)
      );
    } else {
      setValue('primaryGoals', [...current, value]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          What are your fitness goals?
        </h2>
        <p className="text-muted-foreground">
          Select all that apply - we&apos;ll create a program that addresses your goals.
        </p>
      </div>

      {/* Goal Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoals.includes(goal.value);

          return (
            <button
              key={goal.value}
              type="button"
              onClick={() => toggleGoal(goal.value)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left cursor-pointer
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
                    <h3 className="font-semibold text-foreground mb-1">{goal.label}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected ? 'bg-blue-600 border-2 border-blue-600' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {errors.primaryGoals && (
        <p className="text-sm text-destructive">{errors.primaryGoals.message}</p>
      )}

      {/* Goals Elaboration */}
      <div className="pt-4">
        <label className="block text-sm font-medium mb-2 text-foreground">
          Tell us more about your specific goals{' '}
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <textarea
          {...register('goalsElaboration')}
          placeholder="e.g., I want to lose 20lbs for my wedding, or I want to deadlift 400lbs..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white text-foreground border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
        {errors.goalsElaboration && (
          <p className="mt-1 text-sm text-destructive">{errors.goalsElaboration.message}</p>
        )}
      </div>
    </div>
  );
}
