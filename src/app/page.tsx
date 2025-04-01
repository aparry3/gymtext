'use client';

import SignUpForm from '@/components/SignUpForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          GymText
        </h1>
        <p className="text-xl text-center max-w-2xl mb-8 text-gray-300">
          Get personalized daily workouts delivered straight to your phone. 
          Transform your fitness journey with AI-powered workout recommendations.
        </p>
        <div className="animate-bounce mt-12">
          <p className="text-gray-400">Scroll down to get started</p>
          <div className="w-6 h-6 mx-auto mt-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-16">
        <SignUpForm />
      </section>
    </main>
  );
}
