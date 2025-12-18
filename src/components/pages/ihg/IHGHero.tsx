import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';

const IHGHero: React.FC = () => {
  return (
    <div className="relative h-screen min-h-[750px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-100"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop')`
        }}
      >
        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-emerald-950/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center md:text-left w-full pt-20">
        <div className="md:w-3/5 space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-400/30">
            <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-pulse"></span>
            <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">EVEN Hotels x GymText Partnership</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-8xl font-serif text-white leading-[1.05] tracking-tight">
            Keep Your <br />
            <span className="text-orange-400 italic">Balance.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
            Wellness your way, every single stay. We&apos;ve enhanced our in-room training zones with <strong className="font-bold">GymText AI</strong>—your personal coach that adapts to your room and your goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
            <button className="w-full sm:w-auto px-10 py-5 bg-orange-500 text-white rounded-full font-bold uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 shadow-2xl hover:shadow-orange-500/40">
              <span>Book Your Stay</span>
              <ArrowRight size={18} />
            </button>

            <button className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/40 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center space-x-2">
              <MessageSquare size={18} />
              <span>Demo the AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-white/60">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Stay Well</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"></div>
      </div>
    </div>
  );
};

export default IHGHero;
