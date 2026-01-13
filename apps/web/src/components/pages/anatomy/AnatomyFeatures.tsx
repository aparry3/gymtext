'use client';

import React from 'react';
import { ArrowRight, Check, Dumbbell, MessageSquare, Smartphone, Zap } from 'lucide-react';

const FEATURES = [
  { icon: Dumbbell, title: "Personalized Workouts", desc: "Built specifically for your body and goals." },
  { icon: MessageSquare, title: "24/7 Text Coaching", desc: "Real human feedback whenever you need it." },
  { icon: Zap, title: "Adaptive Programming", desc: "Plans that shift when your schedule does." },
  { icon: ArrowRight, title: "Progress Tracking", desc: "Simple logging to ensure you're improving." },
  { icon: Check, title: "Exercise Library", desc: "Video demos for every movement." },
  { icon: Smartphone, title: "No App Required", desc: "Zero friction. Everything via SMS." },
];

const AnatomyFeatures: React.FC = () => {
  return (
    <section id="features" className="py-32 bg-zinc-950">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
          {FEATURES.map((feature, i) => (
            <div key={i} className="bg-anatomy-black p-10 hover:bg-zinc-900 transition-colors group">
              <feature.icon className="text-white mb-6 w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
              <h4 className="text-white text-lg font-bold uppercase tracking-widest mb-3">{feature.title}</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnatomyFeatures;
