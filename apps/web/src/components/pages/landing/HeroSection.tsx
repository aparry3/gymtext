'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onScrollToSection?: (id: string) => void;
}

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
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
          className="object-cover object-center"
          priority
        />
        {/* Gradient Overlay - Darker for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-slate-950/20 md:from-slate-950/90 md:via-slate-950/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 mt-16 md:mt-0">
        <div className="max-w-3xl flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Personal Training. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BA3FF] to-[#1B81FF]">
              Texted to You.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            GymText delivers personalized workouts, coaching, and accountability
            through simple daily text messages. No apps. No dashboards. Just
            training that works.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/start"
              className="bg-[#1B81FF] hover:bg-[#1468CC] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              Start Training <ArrowRight size={20} />
            </Link>
            <button
              onClick={handleScrollClick}
              className="bg-slate-900/90 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur flex items-center justify-center"
            >
              See How It Works
            </button>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm text-slate-400">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D'].map((initial, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-slate-950 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p>Trusted by 1,000+ athletes</p>
          </div>
        </div>
      </div>
    </header>
  );
}
