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
    <header className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg"
          alt="Athlete training"
          fill
          className="object-cover object-[70%_48%] md:object-[60%_center]"
          priority
        />
        {/* Gradient Overlay - Top for header fade (mobile only) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_white_0%,_white_20%,_transparent_50%)] md:bg-none"></div>
        {/* Gradient Overlay - Left-to-right for text readability (stronger on desktop) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent md:from-white md:via-white/50 md:to-transparent"></div>
        {/* Gradient Overlay - Bottom for section transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        {/* Gradient Overlay - Bottom-left corner for extra text contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_white_0%,_white_30%,_transparent_70%)]"></div>
        {/* Gradient Overlay - Circular spotlight on person (mobile only) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_55%,_transparent_20%,_white_60%)] md:hidden"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-between py-24 md:py-32">
        {/* Top section: Title + Description */}
        <div className="max-w-3xl flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-[1.1] text-gray-900">
            Personal Training. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BA3FF] to-[#1B81FF]">
              Texted to You.
            </span>
          </h1>

          <p className="text-base md:text-xl max-w-2xl leading-relaxed text-gray-700">
            GymText delivers personalized workouts, coaching, and accountability
            through simple daily text messages. No apps. No dashboards. Just
            training that works.
          </p>
        </div>

        {/* Bottom section: Buttons */}
        <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 md:gap-4 w-full sm:w-auto">
          <Link
            href="/start"
            className="bg-[#1B81FF] hover:bg-[#1468CC] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            Start Training <ArrowRight size={18} className="md:w-5 md:h-5" />
          </Link>
          <button
            onClick={handleScrollClick}
            className="px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-lg transition-all backdrop-blur flex items-center justify-center bg-gray-900/10 hover:bg-gray-900/20 text-gray-900"
          >
            See How It Works
          </button>
        </div>
      </div>
    </header>
  );
}
