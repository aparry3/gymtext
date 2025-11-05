'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Status = 'initial' | 'creating_user' | 'creating_plan' | 'completed' | 'redirecting' | 'error';

export default function WorkoutSetupClient() {
  const [status, setStatus] = useState<Status>('initial');
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const setupUser = async () => {
      try {
        // Get form data from sessionStorage
        const signupDataStr = sessionStorage.getItem('gymtext_signup_data');

        if (!signupDataStr) {
          setError('No signup data found. Please try signing up again.');
          setStatus('error');
          return;
        }

        const signupData = JSON.parse(signupDataStr);
        setUserName(signupData.name);

        // Step 1: Create user and set session (this will wait for profile extraction)
        setStatus('creating_user');
        const userResponse = await fetch('/api/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(signupData),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Failed to create user');
        }

        const userData = await userResponse.json();

        // Step 2: Create workout plan
        setStatus('creating_plan');
        const programResponse = await fetch('/api/programs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.userId,
          }),
        });

        if (!programResponse.ok) {
          throw new Error('Failed to create workout plan');
        }

        // Clear sessionStorage after successful signup
        sessionStorage.removeItem('gymtext_signup_data');

        setStatus('completed');

        // Redirect to user dashboard after a short delay
        setStatus('redirecting');
        setTimeout(() => {
          window.location.href = '/me';
        }, 2000);
      } catch (err) {
        console.error('Error setting up user:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStatus('error');
      }
    };

    if (status === 'initial') {
      setupUser();
    }
  }, [status]);

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
      <h1 className="text-4xl font-bold text-[#2d3748] mb-4">Welcome to GYMTEXT!</h1>

      {userName && (
        <p className="text-xl text-[#7a8599] mb-8">
          Thanks for signing up, {userName}! We&apos;re excited to help you achieve your fitness goals!
        </p>
      )}

      {/* Status messages */}
      {status === 'creating_user' && (
        <div className="my-6">
          <div className="animate-pulse text-xl text-[#4338ca] font-medium">
            Creating your account and analyzing your fitness profile...
          </div>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4338ca] rounded-full w-1/3 animate-pulse"></div>
          </div>
        </div>
      )}

      {status === 'creating_plan' && (
        <div className="my-6">
          <div className="animate-pulse text-xl text-[#4338ca] font-medium">
            Building your personalized workout plan...
          </div>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4338ca] rounded-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      )}

      {(status === 'completed' || status === 'redirecting') && (
        <div className="my-6">
          <p className="text-lg text-[#7a8599] mb-8">
            Your workout plan is ready! You&apos;ll receive your first workout via text message soon.
          </p>
          {status === 'redirecting' && (
            <div className="animate-pulse text-lg text-[#4338ca] font-medium">
              Redirecting to your dashboard...
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="text-red-600 mb-8">
          <p className="font-medium">Something went wrong:</p>
          <p>{error}</p>
          <p className="mt-2">Please try signing up again or contact support.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block bg-[#4338ca] text-white py-3 px-8 rounded-md hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:ring-offset-2 text-lg font-medium tracking-wide"
          >
            Return to Home
          </Link>
        </div>
      )}
    </div>
  );
} 