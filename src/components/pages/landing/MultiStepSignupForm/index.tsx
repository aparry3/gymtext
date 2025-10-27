'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormProgressIndicator } from './FormProgressIndicator';
import { BioStep } from './FormSteps/BioStep';
import { GoalsStep } from './FormSteps/GoalsStep';
import { ExperienceStep } from './FormSteps/ExperienceStep';
import { ActivityStep } from './FormSteps/ActivityStep';
import { PreferencesStep } from './FormSteps/PreferencesStep';
import { SubmitStep } from './FormSteps/SubmitStep';
import { Button } from '@/components/ui/button';

// Form validation schema
const formSchema = z.object({
  // Bio
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  preferredSendHour: z.number().min(0).max(23),
  timezone: z.string().min(1, 'Timezone is required'),

  // Goals
  primaryGoals: z.array(z.enum(['strength', 'endurance', 'weight_loss', 'general_fitness'])).min(1, 'Please select at least one goal'),
  goalsElaboration: z.string().optional(),

  // Experience
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your experience level',
  }),

  // Activity
  currentActivity: z.enum(['not_active', 'once_per_week', '2_3_per_week', '4_plus_per_week'], {
    required_error: 'Please select your current activity level',
  }),
  activityElaboration: z.string().optional(),

  // Preferences
  trainingLocation: z.enum(['home', 'commercial_gym', 'bodyweight'], {
    required_error: 'Please select your training location',
  }),
  equipment: z.array(z.string()).min(1, 'Please select at least one equipment option'),
  injuries: z.string().optional(),

  // Submit
  acceptRisks: z.boolean().refine((val) => val === true, {
    message: 'You must accept the risks associated with exercise',
  }),
});

export type FormData = z.infer<typeof formSchema>;

const STEP_LABELS = [
  'Your Info',
  'Your Goals',
  'Experience',
  'Activity Level',
  'Preferences',
  'Finish',
];

export function MultiStepSignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredSendHour: 8,
      timezone: 'America/New_York',
      primaryGoals: [],
      equipment: [],
    },
    mode: 'onBlur',
  });

  const handleNext = async () => {
    // Validate current step before moving forward
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate as (keyof FormData)[]);

    if (isValid) {
      const nextStep = Math.min(currentStep + 1, 6);
      setCurrentStep(nextStep);
      setVisitedSteps((prev) => new Set([...prev, nextStep]));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    // Only allow navigation to visited steps that are before the current step
    if (visitedSteps.has(step) && step < currentStep) {
      setCurrentStep(step);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Format phone number with +1 prefix
      const formattedData = {
        ...data,
        phoneNumber: data.phoneNumber.startsWith('+1')
          ? data.phoneNumber
          : `+1${data.phoneNumber}`,
        // Map form data to existing signup format
        fitnessGoals: data.primaryGoals.map(getGoalDescription).join(', '),
        goalsElaboration: data.goalsElaboration,
        currentExercise: getActivityDescription(data.currentActivity),
        activityElaboration: data.activityElaboration,
        gender: 'prefer_not_to_say', // Can be added to form if needed
        age: '30', // Can be added to form if needed
      };

      // Store form data in sessionStorage for the success page to use
      sessionStorage.setItem('gymtext_signup_data', JSON.stringify(formattedData));

      // Redirect to success/loading page
      window.location.href = '/success';
    } catch (error) {
      console.error('Error preparing signup:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative lg:flex lg:gap-8 lg:items-start">
      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6 lg:max-w-3xl">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 lg:max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Mobile progress indicator */}
          <div className="lg:hidden">
            <FormProgressIndicator
              currentStep={currentStep}
              totalSteps={6}
              stepLabels={STEP_LABELS}
              visitedSteps={visitedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Step content */}
          <div className="p-6">
            {currentStep === 1 && (
              <BioStep
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === 2 && (
              <GoalsStep
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === 3 && (
              <ExperienceStep
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === 4 && (
              <ActivityStep
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === 5 && (
              <PreferencesStep
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === 6 && (
              <SubmitStep register={register} errors={errors} />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                Back
              </Button>

              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'Processing...' : 'Start My Transformation'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Desktop sticky progress indicator */}
      <div className="hidden lg:block lg:w-64 lg:sticky lg:top-32 lg:self-start">
        <FormProgressIndicator
          currentStep={currentStep}
          totalSteps={6}
          stepLabels={STEP_LABELS}
          visitedSteps={visitedSteps}
          onStepClick={handleStepClick}
        />
      </div>
    </div>
  );
}

// Helper functions
function getFieldsForStep(step: number): (keyof FormData)[] {
  switch (step) {
    case 1:
      return ['name', 'phoneNumber', 'preferredSendHour', 'timezone'];
    case 2:
      return ['primaryGoals'];
    case 3:
      return ['experienceLevel'];
    case 4:
      return ['currentActivity'];
    case 5:
      return ['trainingLocation', 'equipment'];
    case 6:
      return ['acceptRisks'];
    default:
      return [];
  }
}

function getGoalDescription(goal: string): string {
  const goalMap: Record<string, string> = {
    strength: 'Build strength and muscle',
    endurance: 'Improve endurance and stamina',
    weight_loss: 'Lose weight and improve body composition',
    general_fitness: 'Improve overall fitness and health',
  };
  return goalMap[goal] || goal;
}

function getActivityDescription(activity: string): string {
  const activityMap: Record<string, string> = {
    not_active: 'Currently not active (less than 1x/week)',
    once_per_week: 'Active once per week',
    '2_3_per_week': 'Active 2-3 times per week',
    '4_plus_per_week': 'Active 4+ times per week',
  };
  return activityMap[activity] || activity;
}
