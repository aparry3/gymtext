'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Theme } from './LandingPage';

interface HeroSectionProps {
  onScrollToSection?: (id: string) => void;
  theme?: Theme;
}

export function HeroSection({ onScrollToSection, theme = 'dark' }: HeroSectionProps) {
  const isLight = theme === 'light';

  const handleScrollClick = () => {
    if (onScrollToSection) {
      onScrollToSection('how-it-works');
    } else {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg"
          alt="Athlete training"
          fill
          className="object-cover object-[70%_center] md:object-[60%_center]"
          priority
        />
        {/* Gradient Overlay - Left-to-right for text readability */}
        <div className={`absolute inset-0 bg-gradient-to-r ${
          isLight
            ? 'from-white via-white/50 to-transparent md:from-white md:via-white/40 md:to-transparent'
            : 'from-slate-950/80 via-slate-950/40 to-transparent md:from-slate-950/90 md:via-slate-950/50 md:to-slate-950/20'
        }`}></div>
        {/* Gradient Overlay - Bottom only for section transition */}
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isLight
            ? 'from-white via-transparent to-transparent'
            : 'from-slate-950 via-transparent to-transparent'
        }`}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 mt-16 md:mt-0">
        <div className="max-w-3xl flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-[1.1] ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            Personal Training. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BA3FF] to-[#1B81FF]">
              Texted to You.
            </span>
          </h1>

          <p className={`text-base md:text-xl mb-8 md:mb-10 max-w-2xl leading-relaxed ${
            isLight ? 'text-gray-600' : 'text-slate-300'
          }`}>
            GymText delivers personalized workouts, coaching, and accountability
            through simple daily text messages. No apps. No dashboards. Just
            training that works.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
            <Link
              href="/start"
              className="bg-[#1B81FF] hover:bg-[#1468CC] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              Start Training <ArrowRight size={18} className="md:w-5 md:h-5" />
            </Link>
            <button
              onClick={handleScrollClick}
              className={`px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all backdrop-blur flex items-center justify-center ${
                isLight
                  ? 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-white'
              }`}
            >
              See How It Works
            </button>
          </div>

          {/* <div className="mt-12 flex items-center gap-4 text-sm text-slate-400">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D'].map((initial, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-950 bg-gradient-to-br from-[#5BA3FF] to-[#1B81FF] flex items-center justify-center text-white font-bold text-sm"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p>Trusted by 1,000+ athletes</p>
          </div> */}
        </div>
      </div>
    </header>
  );
}
