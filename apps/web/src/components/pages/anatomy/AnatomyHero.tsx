'use client';

import React from 'react';
import Button from './Button';

const AnatomyHero: React.FC = () => {
  return (
    <section id="hero" className="relative h-screen min-h-[700px] flex items-end pb-24 md:pb-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://anatomyfitness.com/wp-content/uploads/2025/01/Sweat-1536x1026.jpg"
          alt="Anatomy Gym Interior"
          className="w-full h-full object-cover filter grayscale brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-anatomy-black via-anatomy-black/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest text-white leading-tight mb-6">
            The Future of <br /> Training, <span className="text-zinc-500">Anywhere.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 font-light max-w-xl mb-10 leading-relaxed">
            Anatomy-level programming + a GymText coach in your pocket—delivered by text, every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="#plans" variant="primary">Get Started</Button>
            <Button href="#how-it-works" variant="outline">See How It Works</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnatomyHero;
