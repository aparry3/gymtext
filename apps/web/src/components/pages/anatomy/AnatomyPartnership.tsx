'use client';

import React from 'react';

const AnatomyPartnership: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-anatomy-black border-b border-zinc-900">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 mb-8">The Partnership</h2>
          <p className="text-2xl md:text-3xl leading-relaxed text-white font-light">
            <span className="font-bold">Anatomy</span> is built on sports science, performance, and community. <span className="font-bold">GymText</span> brings that same standard to daily coaching—through simple text messages. No apps to download. Just results.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnatomyPartnership;
