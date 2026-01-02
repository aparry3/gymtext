import React from 'react';
import { MapPin, UserCheck } from 'lucide-react';
import { GymTextWordmark } from './GymTextLogo';
import { EvenLogo } from './EvenLogo';

const IHGPartnershipIntro: React.FC = () => {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">

          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-xs">Wellness Your Way</span>
              <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                An In-Room Studio, <br />
                <span className="italic text-emerald-600">Digitally Guided.</span>
              </h2>
            </div>

            <p className="text-xl text-slate-600 font-light leading-relaxed">
              EVEN Hotels were designed with wellness in mind, featuring in-room training zones and top-tier fitness centers. By partnering with <strong className="text-emerald-700 font-bold">GymText</strong>, we&apos;ve added an intelligent brain to those muscles.
            </p>
            <p className="text-lg text-slate-500 leading-relaxed">
              Whether you&apos;re using the resistance bands and core balls in your room or the professional equipment in the Athletic Studio, GymText texts you custom-built circuits that make the most of every square foot of your stay.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="flex space-x-4">
                <div className="h-12 w-12 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Room Intelligence</h4>
                  <p className="text-sm text-slate-500">Knows your specific EVEN Hotel room type and available gear.</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="h-12 w-12 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Tailored Coaching</h4>
                  <p className="text-sm text-slate-500">Workouts that evolve with your progress and your travel schedule.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Imagery */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200">
              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
                alt="Personal training at EVEN Hotels"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Brand Badge */}
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-2xl border border-emerald-50 max-w-sm">
              <div className="flex items-center space-x-6 mb-5 pb-5 border-b border-slate-100">
                <EvenLogo className="h-8" />
                <span className="text-slate-300 font-light text-2xl">x</span>
                <GymTextWordmark className="h-7" variant="color" />
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-emerald-500 italic text-4xl leading-none">&quot;</div>
                <p className="text-slate-600 text-sm italic font-medium leading-relaxed">
                  &quot;I stayed at the EVEN Hotel New York Times Square. GymText transformed my in-room training zone into a high-performance studio.&quot;
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default IHGPartnershipIntro;
