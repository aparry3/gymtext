'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCookieData } from '@/shared/utils/cookies';

type Status = 'initial' | 'onboarding' | 'completed' | 'error';

export default function WorkoutSetupClient({ user }: { user: UserCookieData | null }) {
  const [status, setStatus] = useState<Status>('initial');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupWorkout = async () => {
      if (!user) {
        setError('User data not found');
        return;
      }

      try {
        // Step 1: Onboard the user
        setStatus('onboarding');
        const onboardResponse = await fetch('/api/programs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });

        if (!onboardResponse.ok) {
          throw new Error('Failed to onboard user');
        }

        setStatus('completed');
      } catch (err) {
        console.error('Error setting up workout plan:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStatus('error');
      }
    };

    if (status === 'initial' && user) {
      setupWorkout();
    }
  }, [user, status]);

  // Render based on current status
  return (
    <div className="max-w-2xl mx-auto p-10 text-center">
      <div className="mb-8 flex justify-center">
        <div className="rounded-full bg-green-100 p-4">
          <svg 
            className="h-16 w-16 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-[#2d3748] mb-4">Payment Successful!</h1>
      
      {user ? (
        <p className="text-xl text-[#7a8599] mb-8">
          Thank you for signing up with GYMTEXT, {user.name}! We&apos;re excited to help you achieve your fitness goals!
        </p>
      ) : (
        <p className="text-xl text-[#7a8599] mb-8">
          Thank you for signing up with GYMTEXT. We&apos;re excited to help you achieve your fitness goals!
        </p>
      )}

      {/* Status messages */}
      {status === 'onboarding' && (
        <div className="my-6">
          <div className="animate-pulse text-xl text-[#4338ca] font-medium">
            Creating your workout plan...
          </div>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4338ca] rounded-full w-1/3"></div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <p className="text-lg text-[#7a8599] mb-8">
          Your workout plan is ready! You&apos;ll receive your first workout via text message soon. 
          Get ready to start your fitness journey!
        </p>
      )}

      {status === 'error' && (
        <div className="text-red-600 mb-8">
          <p className="font-medium">Something went wrong setting up your workout plan:</p>
          <p>{error}</p>
          <p className="mt-2">Don&apos;t worry, our team has been notified and will fix this for you soon.</p>
        </div>
      )}

      <div className="mt-8">
        <Link 
          href="/" 
          className="inline-block bg-[#4338ca] text-white py-3 px-8 rounded-md hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:ring-offset-2 text-lg font-medium tracking-wide"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 