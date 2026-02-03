'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const SLIDES = [
  {
    id: 'outdoor',
    image:
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80',
    title: 'The Operating System for Outdoor Retail',
    subtitle: 'Engage customers with training plans for their next adventure.',
  },
  {
    id: 'hotel',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80',
    title: 'Curated Wellness for Hospitality',
    subtitle: 'Premium in-room recovery and mobility sessions for your guests.',
  },
  {
    id: 'sports',
    image:
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80',
    title: 'High Performance Coaching at Scale',
    subtitle: 'Deliver pro-level game prep and recovery directly to athletes.',
  },
];

export const BrandsHeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden flex items-center justify-center bg-gray-900">
      {/* Background Carousel */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000 ease-linear"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.1)' : 'scale(1.0)',
            }}
          ></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-gray-900 via-black/40 to-black/30"></div>
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-8 mx-auto">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Now onboarding partners
        </div>

        <div className="relative h-48 lg:h-64 mb-6 max-w-4xl mx-auto">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute top-0 left-0 w-full transition-all duration-700 transform ${
                index === currentSlide
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] drop-shadow-lg text-white">
                {slide.title}
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed font-light drop-shadow-md max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 mt-12 lg:mt-0 relative z-30">
          <a
            href="mailto:kyle@gymtext.co"
            className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Partner With Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all"
          >
            See Capabilities
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-200 font-medium border-t border-white/20 pt-8 max-w-2xl mx-auto">
          {['98% Open Rate', 'Zero Friction', 'White-Labeled'].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <div className="bg-green-500/20 rounded-full p-1 border border-green-400/50">
                <Check className="h-3 w-3 text-green-400" strokeWidth={3} />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mt-8 justify-center">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
