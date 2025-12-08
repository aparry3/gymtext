'use client';

import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '../index';
import { Check } from 'lucide-react';

interface ActivityStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

const daysPerWeekOptions = [
  {
    value: '3_per_week' as const,
    label: '3 Days Per Week',
    description: 'I want to train 3x/week',
  },
  {
    value: '4_per_week' as const,
    label: '4 Days Per Week',
    description: 'I want to train 4x/week',
  },
  {
    value: '5_per_week' as const,
    label: '5 Days Per Week',
    description: 'I want to train 5x/week',
  },
  {
    value: '6_per_week' as const,
    label: '6 Days Per Week',
    description: 'I want to train 6x/week',
  },
];

export function ActivityStep({ register, setValue, watch, errors }: ActivityStepProps) {
  const selectedDays = watch('desiredDaysPerWeek');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          How many days a week can you exercise?
        </h2>
        <p className="text-muted-foreground">
          This helps us design a program that fits your schedule.
        </p>
      </div>

      {/* Days Per Week Options */}
      <div className="space-y-3">
        {daysPerWeekOptions.map((option) => {
          const isSelected = selectedDays === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('desiredDaysPerWeek', option.value)}
              className={`
                w-full p-3 md:p-4 rounded-xl border-2 transition-all text-left cursor-pointer
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-white hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold md:text-base text-foreground">{option.label}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
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

      {errors.desiredDaysPerWeek && (
        <p className="text-sm font-medium text-red-600">{errors.desiredDaysPerWeek.message}</p>
      )}

      {/* Availability Elaboration */}
      <div className="pt-4">
        <label className="block text-sm font-medium mb-2 text-foreground">
          Tell us more about your availability{' '}
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <textarea
          {...register('availabilityElaboration')}
          placeholder="e.g., I prefer mornings before work, weekends are flexible..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white text-foreground border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
        {errors.availabilityElaboration && (
          <p className="mt-1 text-sm font-medium text-red-600">{errors.availabilityElaboration.message}</p>
        )}
      </div>
    </div>
  );
}
