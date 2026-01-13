'use client';

import React from 'react';
import { TESTIMONIALS } from './constants';

const AnatomyTestimonials: React.FC = () => {
  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-8 bg-zinc-900/50 border border-zinc-800/50">
              <p className="text-zinc-300 italic mb-6 text-lg font-light leading-relaxed">&quot;{t.quote}&quot;</p>
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-widest">{t.author}</p>
                <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnatomyTestimonials;
