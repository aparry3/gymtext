'use client';

import { ClipboardList, Dumbbell, Smartphone } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#1B81FF] uppercase tracking-widest mb-2">
            Simple & Effective
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
            How GymText Works
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r z-0 from-gray-200 via-[#1B81FF]/30 to-gray-200"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-colors duration-300 bg-white border border-gray-200 group-hover:border-[#1B81FF]/50">
              <ClipboardList className="w-10 h-10 text-[#1B81FF]" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">
              1. Tell us your goals
            </h4>
            <p className="leading-relaxed text-gray-500">
              Fill out a quick profile about your equipment, schedule, and
              fitness targets.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-colors duration-300 bg-white border border-gray-200 group-hover:border-[#1B81FF]/50">
              <Dumbbell className="w-10 h-10 text-[#1B81FF]" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">
              2. Get a custom plan
            </h4>
            <p className="leading-relaxed text-gray-500">
              Your coach builds a personalized routine designed specifically for
              your life.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-colors duration-300 bg-white border border-gray-200 group-hover:border-[#1B81FF]/50">
              <Smartphone className="w-10 h-10 text-[#1B81FF]" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">
              3. Receive daily workouts
            </h4>
            <p className="leading-relaxed text-gray-500">
              Wake up to your workout text. Reply when you&apos;re done. Simple
              accountability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
