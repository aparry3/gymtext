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

const activityLevels = [
  {
    value: 'not_active' as const,
    label: 'Not Active',
    description: 'Less than 1x/week',
  },
  {
    value: 'once_per_week' as const,
    label: 'Once Per Week',
    description: 'Working out about 1x/week',
  },
  {
    value: '2_3_per_week' as const,
    label: '2-3 Times Per Week',
    description: 'Regular activity 2-3x/week',
  },
  {
    value: '4_plus_per_week' as const,
    label: '4+ Times Per Week',
    description: 'Very active, 4+ sessions/week',
  },
];

export function ActivityStep({ register, setValue, watch, errors }: ActivityStepProps) {
  const selectedActivity = watch('currentActivity');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          How active are you currently?
        </h2>
        <p className="text-muted-foreground">
          This helps us understand your starting point and set realistic goals.
        </p>
      </div>

      {/* Activity Level Options */}
      <div className="space-y-3">
        {activityLevels.map((level) => {
          const isSelected = selectedActivity === level.value;

          return (
            <button
              key={level.value}
              type="button"
              onClick={() => setValue('currentActivity', level.value)}
              className={`
                w-full p-4 rounded-xl border-2 transition-all text-left cursor-pointer
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-white hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{level.label}</h3>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
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

      {errors.currentActivity && (
        <p className="text-sm text-destructive">{errors.currentActivity.message}</p>
      )}

      {/* Activity Elaboration */}
      <div className="pt-4">
        <label className="block text-sm font-medium mb-2 text-foreground">
          Tell us more about your current activity{' '}
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </label>
        <textarea
          {...register('activityElaboration')}
          placeholder="e.g., I run 3 miles on weekdays, lift weights on weekends..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white text-foreground border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
        />
        {errors.activityElaboration && (
          <p className="mt-1 text-sm text-destructive">{errors.activityElaboration.message}</p>
        )}
      </div>
    </div>
  );
}
