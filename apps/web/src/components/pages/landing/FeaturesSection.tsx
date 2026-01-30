'use client';

import { Clock, Dumbbell, CheckCircle2 } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for Real Life
          </h2>
          <p className="text-slate-400 text-lg">
            GymText isn&apos;t for people who love staring at their phones.
            It&apos;s for people who want to get in, do the work, and get on
            with their day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800 transition-all group">
            <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-[#1B81FF] group-hover:bg-[#1B81FF] group-hover:text-white transition-colors">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Busy Professionals
            </h3>
            <p className="text-slate-400">
              You have 45 minutes. We give you exactly what to do so you
              don&apos;t waste a second thinking about it.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800 transition-all group">
            <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-[#1B81FF] group-hover:bg-[#1B81FF] group-hover:text-white transition-colors">
              <Dumbbell size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Lifters & Runners
            </h3>
            <p className="text-slate-400">
              Whether you have a full home gym or just a pair of running shoes,
              we program for your equipment.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800 transition-all group">
            <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-[#1B81FF] group-hover:bg-[#1B81FF] group-hover:text-white transition-colors">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Consistency Seekers
            </h3>
            <p className="text-slate-400">
              The hardest part is showing up. We provide the structure and nudge
              you need to stay consistent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
