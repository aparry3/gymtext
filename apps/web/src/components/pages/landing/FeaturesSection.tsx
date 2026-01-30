'use client';

import { Clock, Dumbbell, CheckCircle2 } from 'lucide-react';
import type { Theme } from './LandingPage';

interface FeaturesSectionProps {
  theme?: Theme;
}

export function FeaturesSection({ theme = 'dark' }: FeaturesSectionProps) {
  const isLight = theme === 'light';

  return (
    <section id="features" className={`py-24 ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            Built for Real Life
          </h2>
          <p className={`text-lg ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
            GymText isn&apos;t for people who love staring at their phones.
            It&apos;s for people who want to get in, do the work, and get on
            with their day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className={`p-8 rounded-2xl transition-all group ${
            isLight
              ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
          }`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-6 text-[#1B81FF] group-hover:bg-[#1B81FF] group-hover:text-white transition-colors ${
              isLight ? 'bg-gray-200' : 'bg-slate-800'
            }`}>
              <Clock size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Busy Professionals
            </h3>
            <p className={isLight ? 'text-gray-500' : 'text-slate-400'}>
              You have 45 minutes. We give you exactly what to do so you
              don&apos;t waste a second thinking about it.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`p-8 rounded-2xl transition-all group ${
            isLight
              ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
          }`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-6 text-[#1B81FF] group-hover:bg-[#1B81FF] group-hover:text-white transition-colors ${
              isLight ? 'bg-gray-200' : 'bg-slate-800'
            }`}>
              <Dumbbell size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Lifters & Runners
            </h3>
            <p className={isLight ? 'text-gray-500' : 'text-slate-400'}>
              Whether you have a full home gym or just a pair of running shoes,
              we program for your equipment.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`p-8 rounded-2xl transition-all group ${
            isLight
              ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
          }`}>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-6 text-[#1B81FF] group-hover:bg-[#1B81FF] group-hover:text-white transition-colors ${
              isLight ? 'bg-gray-200' : 'bg-slate-800'
            }`}>
              <CheckCircle2 size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Consistency Seekers
            </h3>
            <p className={isLight ? 'text-gray-500' : 'text-slate-400'}>
              The hardest part is showing up. We provide the structure and nudge
              you need to stay consistent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
