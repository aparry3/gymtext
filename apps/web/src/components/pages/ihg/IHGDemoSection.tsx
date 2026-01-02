'use client';

import React from 'react';

const IHGDemoSection: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black tracking-[0.3em] text-[10px] uppercase">Real-Time Guidance</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mt-2">Chat with your EVEN Coach</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mt-4 text-lg font-light">
            No apps, no barriers. Just a simple SMS thread that knows your room, your gear, and your goals.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">

          {/* Phone Mockup Container with Video */}
          <div className="relative w-[340px] h-[680px] bg-black rounded-[3.5rem] border-[12px] border-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden ring-1 ring-white/10">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-30"></div>

            {/* Video Content */}
            <div className="w-full h-full pt-8 bg-white overflow-hidden">
              <video
                src="/GymTextDemo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Feature Highlight Text */}
          <div className="lg:w-1/3 space-y-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-slate-900">SMS-Based Simplicity</h3>
              <p className="text-slate-500 font-light leading-relaxed">
                Your workout should be the hard part, not the technology. GymText lives where you already are: in your messages. No apps to download, no storage space required.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 group">
                <div className="h-10 w-10 shrink-0 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <span className="font-bold">01</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Context Awareness</h4>
                  <p className="text-sm text-slate-500">The AI knows exactly which EVEN Hotel you&apos;re in and what equipment is available in your specific training zone.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="h-10 w-10 shrink-0 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <span className="font-bold">02</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Instant Expertise</h4>
                  <p className="text-sm text-slate-500">Unsure about a movement? Just ask. Get clear, professional advice on form and modifications instantly.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group">
                <div className="h-10 w-10 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <span className="font-bold">03</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Proactive Coaching</h4>
                  <p className="text-sm text-slate-500">Your trainer checks in. &quot;See you at the gym&quot; isn&apos;t just a sign-off—it&apos;s your new accountability partner.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default IHGDemoSection;
