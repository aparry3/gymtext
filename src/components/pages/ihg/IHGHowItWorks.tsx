import React from 'react';
import { Smartphone, Dumbbell, Coffee } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    title: "1. Check In, Connect",
    description: "Scan the in-room GymText code. It instantly recognizes your EVEN Hotel location and room amenities."
  },
  {
    icon: Dumbbell,
    title: "2. Follow Your Flow",
    description: "Receive a personalized workout via SMS. Exercises use your in-room Training Zone or the Athletic Studio."
  },
  {
    icon: Coffee,
    title: "3. Eat Well, Rest Well",
    description: "Post-workout, GymText suggests nutrient-dense options from Cork & Kale, our onsite wellness bar."
  }
];

const IHGHowItWorks: React.FC = () => {
  return (
    <section className="py-32 bg-emerald-950 text-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-emerald-400 font-black tracking-[0.3em] text-[10px] uppercase">The EVEN Standard</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-4">Wellness That Works</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-16 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-px bg-emerald-800/50 z-0"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-emerald-900 rounded-[2rem] border border-emerald-800 flex items-center justify-center mb-8 shadow-2xl group-hover:bg-emerald-600 group-hover:scale-105 transition-all duration-500 group-hover:shadow-emerald-500/20">
                <step.icon size={36} className="text-emerald-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-serif mb-4 text-white group-hover:text-emerald-400 transition-colors">{step.title}</h3>
              <p className="text-emerald-200/70 leading-relaxed max-w-xs font-light tracking-wide">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <div className="inline-block bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 md:p-14 border border-white/10 max-w-4xl shadow-2xl">
            <p className="text-2xl md:text-3xl font-serif italic text-emerald-50 leading-relaxed mb-8">
              &quot;EVEN Hotels already has the best in-room fitness, but GymText is the missing piece. It&apos;s like having a coach who actually knows what equipment is in my room.&quot;
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-emerald-500/30">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Reviewer" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold tracking-wide">David Sterling</p>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Marathon Runner & EVEN Guest</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IHGHowItWorks;
