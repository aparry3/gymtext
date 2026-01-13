'use client';

import React from 'react';
import Button from './Button';

const TRACKS = ["Gym + Classes Track", "Strength Focus", "Fat Loss + Conditioning", "Travel / Minimal Equipment"];

const AnatomyMembers: React.FC = () => {
  return (
    <section className="py-24 bg-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Exclusive Access</span>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-white mb-6">
            Made for <br /> Anatomy Members
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-md font-light">
            Your plan complements your Anatomy training—whether you&apos;re lifting, taking classes, or traveling.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {TRACKS.map(track => (
              <div key={track} className="border border-zinc-700 p-4 text-center hover:border-white transition-colors cursor-default">
                <span className="text-xs uppercase tracking-wider text-white">{track}</span>
              </div>
            ))}
          </div>
          <Button href="#plans" variant="primary">View Member Perks</Button>
        </div>
        <div className="flex-1 w-full max-w-lg">
          <div className="aspect-[4/5] bg-zinc-800 relative">
            <img
              src="https://picsum.photos/id/342/800/1000"
              alt="Member Training"
              className="w-full h-full object-cover filter grayscale contrast-125"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnatomyMembers;
