'use client';

import React from 'react';
import Button from './Button';

const AnatomyCta: React.FC = () => {
  return (
    <section className="py-32 bg-white text-black text-center">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-6">Start Today</h2>
        <p className="text-lg text-zinc-600 mb-10 max-w-xl mx-auto">
          Experience the future of personal training. No apps. No friction. Just results.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button href="#plans" variant="secondary" className="min-w-[200px]">Start with GymText</Button>
          <Button href="#contact" variant="outline" className="border-black text-black hover:bg-black hover:text-white min-w-[200px]">Contact Concierge</Button>
        </div>
      </div>
    </section>
  );
};

export default AnatomyCta;
