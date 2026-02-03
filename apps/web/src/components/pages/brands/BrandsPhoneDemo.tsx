'use client';

import React from 'react';
import { Dumbbell, Mountain, Hotel, Trophy } from 'lucide-react';

const USE_CASES = [
  {
    label: 'Gyms & Trainers',
    icon: <Dumbbell className="w-5 h-5" />,
    desc: 'Automated daily programming and personal records tracking.',
  },
  {
    label: 'Outdoor Retail',
    icon: <Mountain className="w-5 h-5" />,
    desc: 'Training plans for marathons, hikes, and adventures.',
  },
  {
    label: 'Hospitality',
    icon: <Hotel className="w-5 h-5" />,
    desc: 'In-room recovery, jet-lag protocols, and yoga sessions.',
  },
  {
    label: 'Pro Sports',
    icon: <Trophy className="w-5 h-5" />,
    desc: 'Game day prep, logistics, and readiness questionnaires.',
  },
];

export const BrandsPhoneDemo: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gymblue-600 font-bold tracking-widest text-xs uppercase mb-2 block">
            See it in action
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            A message for every moment.
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Explore how GymText adapts to different industries and use cases.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Use Case Cards */}
          <div className="w-full lg:w-1/2 space-y-4">
            {USE_CASES.map((useCase, index) => (
              <div
                key={index}
                className="w-full text-left p-6 rounded-2xl flex items-start gap-4 border border-gray-200 bg-white"
              >
                <div className="p-3 rounded-xl bg-gray-100 text-gray-500">
                  {useCase.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 text-gray-900">
                    {useCase.label}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {useCase.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Phone Display */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Background Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>

              <div className="transform transition-transform duration-500 hover:scale-[1.02] hover:rotate-1">
                <div className="relative w-full max-w-sm mx-auto">
                  <div className="relative w-full">
                    <img
                      src="/iPhone bezel.png"
                      alt="iPhone frame"
                      className="block w-full h-auto pointer-events-none z-10 relative"
                    />
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute top-[3.7%] left-[6.9%] w-[86.2%] h-[93%] object-cover rounded-[2.3rem] z-0"
                    >
                      <source src="/GymTextDemo.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
