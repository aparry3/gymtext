'use client';

import React from 'react';

const PILLARS = [
  {
    id: '01',
    title: 'TRAIN',
    desc: 'Daily workouts tailored to your goals, schedule, and equipment—sent to you via text.',
    bullets: ['Strength, hypertrophy, or endurance', 'Gym, home, or travel', 'Progression that adapts'],
    img: 'https://anatomyfitness.com/wp-content/uploads/2025/01/Enhance-1-scaled.jpg'
  },
  {
    id: '02',
    title: 'COACH',
    desc: 'Ask questions anytime. Get form cues, substitutions, and adjustments without scheduling.',
    bullets: ['24/7 text access', 'Injury/soreness modifications', 'Accountability check-ins'],
    img: 'https://anatomyfitness.com/wp-content/uploads/2025/01/training2.jpg'
  },
  {
    id: '03',
    title: 'RECOVER',
    desc: 'Recovery-aware programming that supports performance—built around your life.',
    bullets: ['Deloads and fatigue management', 'Mobility suggestions', 'Weekly structure'],
    img: 'https://anatomyfitness.com/wp-content/uploads/2025/01/Recover-1536x864.jpg'
  }
];

const AnatomyPillars: React.FC = () => {
  return (
    <section id="pillars" className="bg-anatomy-black">
      {PILLARS.map((pillar, idx) => (
        <div key={pillar.id} className={`group grid grid-cols-1 md:grid-cols-2 min-h-[80vh] ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
          {/* Content Side */}
          <div className={`flex flex-col justify-center p-12 md:p-24 border-b border-zinc-900 ${idx % 2 === 1 ? 'md:order-2 border-l border-zinc-900' : 'md:order-1 border-r border-zinc-900'}`}>
            <span className="text-6xl md:text-8xl font-bold text-zinc-800 mb-8 tracking-tighter opacity-50 select-none group-hover:text-zinc-700 transition-colors">
              {pillar.id}
            </span>
            <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-white mb-6">
              {pillar.title}
            </h3>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed font-light">
              {pillar.desc}
            </p>
            <ul className="space-y-4">
              {pillar.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                  <span className="text-sm uppercase tracking-wide">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Side */}
          <div className={`relative overflow-hidden h-[50vh] md:h-auto ${idx % 2 === 1 ? 'md:order-1' : 'md:order-2'}`}>
            <img
              src={pillar.img}
              alt={pillar.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:scale-105 transition-transform duration-1000 ease-in-out"
            />
          </div>
        </div>
      ))}
    </section>
  );
};

export default AnatomyPillars;
