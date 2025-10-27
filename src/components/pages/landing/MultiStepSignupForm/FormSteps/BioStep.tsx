'use client';

import { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormData } from '../index';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { TimezoneDisplay } from '@/components/ui/TimezoneDisplay';
import { Check } from 'lucide-react';

interface BioStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

const genderOptions = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'prefer_not_to_say' as const, label: 'Prefer not to say' },
];

export function BioStep({ register, errors, setValue, watch }: BioStepProps) {
  const [detectedTimezone, setDetectedTimezone] = useState<string>('America/New_York');
  const preferredSendHour = watch('preferredSendHour');
  const timezone = watch('timezone');
  const selectedGender = watch('gender');

  // Detect user's timezone on mount
  useEffect(() => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimezone) {
        setDetectedTimezone(userTimezone);
        setValue('timezone', userTimezone);
      }
    } catch (error) {
      console.error('Error detecting timezone:', error);
    }
  }, [setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Let&apos;s get to know you</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Full Name
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="John Doe"
          className="w-full px-4 py-3 rounded-xl bg-white text-foreground border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          What should we call you?
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Phone Number
        </label>
        <input
          type="tel"
          {...register('phoneNumber')}
          placeholder="(555) 123-4567"
          className="w-full px-4 py-3 rounded-xl bg-white text-foreground border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Where we&apos;ll send your daily workouts
        </p>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          Gender
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {genderOptions.map((option) => {
            const isSelected = selectedGender === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('gender', option.value)}
                className={`
                  p-4 rounded-xl border transition-all text-left cursor-pointer
                  ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-input bg-white hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
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
        {errors.gender && (
          <p className="mt-2 text-sm text-destructive">{errors.gender.message}</p>
        )}
      </div>

      {/* Preferred Send Hour */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Daily Workout Time
        </label>
        <TimeSelector
          value={preferredSendHour}
          onChange={(hour) => setValue('preferredSendHour', hour)}
          error={errors.preferredSendHour?.message}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          When should we send your daily workout?
        </p>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Your Timezone
        </label>
        <TimezoneDisplay
          value={timezone}
          onChange={(tz) => setValue('timezone', tz)}
          error={errors.timezone?.message}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Detected: {detectedTimezone}
        </p>
      </div>
    </div>
  );
}
