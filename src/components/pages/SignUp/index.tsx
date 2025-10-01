'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TimeSelector } from '@/components/ui/TimeSelector';
import { TimezoneDisplay } from '@/components/ui/TimezoneDisplay';

// Form validation schema
const formSchema = z.object({
  fitnessGoals: z.string().optional(),
  currentExercise: z.string().optional(),
  injuries: z.string().optional(),
  gender: z.string().min(1, 'Please select your gender'),
  age: z.string().min(1, 'Please enter your age'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  preferredSendHour: z.number().min(0).max(23),
  timezone: z.string().min(1, 'Timezone is required'),
  acceptRisks: z.boolean().refine((val) => val === true, {
    message: 'You must accept the risks associated with exercise',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedTimezone, setDetectedTimezone] = useState<string>('America/New_York');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredSendHour: 8,
      timezone: 'America/New_York',
    },
  });

  const preferredSendHour = watch('preferredSendHour');
  const timezone = watch('timezone');

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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Format phone number with +1 prefix
      const formattedData = {
        ...data,
        phoneNumber: data.phoneNumber.startsWith('+1') ? data.phoneNumber : `+1${data.phoneNumber}`
      };

      // Store form data in sessionStorage for the success page to use
      sessionStorage.setItem('gymtext_signup_data', JSON.stringify(formattedData));

      // Redirect to success/loading page
      window.location.href = '/success';
    } catch (error) {
      console.error('Error preparing signup:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}

        {/* Name */}
        <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Full Name (What should we call you?)</label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Phone Number (What number should we text your workouts to?)</label>
        <input
          type="tel"
          {...register('phoneNumber')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Gender – How do you identify? (This helps us personalize your plan – optional)</label>
        <select
          {...register('gender')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      {/* Age */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Age – What&apos;s your age range? (How young are you feeling these days?)</label>
        <input
          type="number"
          {...register('age')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
        )}
      </div>

      {/* Daily Message Time */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Daily Message Time (When should we send your workout?)</label>
        <TimeSelector
          value={preferredSendHour}
          onChange={(hour) => setValue('preferredSendHour', hour)}
          error={errors.preferredSendHour?.message}
        />
        <p className="mt-1 text-sm text-gray-500">
          Messages will be sent at this time in your local timezone
        </p>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Your Timezone</label>
        <TimezoneDisplay
          value={timezone}
          onChange={(tz) => setValue('timezone', tz)}
          error={errors.timezone?.message}
        />
        <p className="mt-1 text-sm text-gray-500">
          Detected: {detectedTimezone}
        </p>
      </div>

      
      {/* Fitness Goals */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Fitness Goals – What do you want to achieve?</label>
        <textarea
          {...register('fitnessGoals')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.fitnessGoals && (
          <p className="mt-1 text-sm text-red-500">{errors.fitnessGoals.message}</p>
        )}
      </div>

      {/* Current Exercise Activity */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Current Exercise Activity</label>
        <textarea
          {...register('currentExercise')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.currentExercise && (
          <p className="mt-1 text-sm text-red-500">{errors.currentExercise.message}</p>
        )}
      </div>

      {/* Injuries */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Injuries</label>
        <textarea
          {...register('injuries')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.injuries && (
          <p className="mt-1 text-sm text-red-500">{errors.injuries.message}</p>
        )}
      </div>


      {/* Accept Risks Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            {...register('acceptRisks')}
            className="h-5 w-5 rounded border-gray-300 bg-white text-[#4338ca] focus:ring-[#4338ca]"
          />
        </div>
        <div className="ml-3 text-base">
          <label className="text-[#7a8599]">
            I understand and accept the risks associated with exercise.
          </label>
          {errors.acceptRisks && (
            <p className="mt-1 text-sm text-red-500">{errors.acceptRisks.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4338ca] text-white py-3 px-4 rounded-md hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium tracking-wide mt-8"
      >
        {isLoading ? 'Processing...' : '💪 Send It'}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-[#7a8599]">
          By submitting this form, you agree to receive text messages from GYMTEXT.
        </p>
      </div>
    </form>
  );
} 