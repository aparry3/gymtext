import React from 'react';
import { MessageSquare, Mountain, Check } from 'lucide-react';

export const NorronaHowItWorks: React.FC = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-gray-200 pb-8">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">How it works</h2>
          <p className="mt-4 md:mt-0 text-gray-500 max-w-md text-right hidden md:block">
            Simple, frictionless, and designed for your routine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="group">
            <div className="mb-6 text-gray-300 group-hover:text-black transition-colors duration-500">
              <Mountain size={48} strokeWidth={1} />
            </div>
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Step 01</span>
            <h3 className="text-xl font-bold mb-3">Choose Your Focus</h3>
            <p className="text-gray-600 leading-relaxed">
              Select Ski Training for winter performance or Hiking Training for endurance and elevation.
            </p>
          </div>

          <div className="group">
            <div className="mb-6 text-gray-300 group-hover:text-gymtext-blue transition-colors duration-500">
              <MessageSquare size={48} strokeWidth={1} />
            </div>
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Step 02</span>
            <h3 className="text-xl font-bold mb-3">Daily Texts</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive your specialized daily workout via SMS. No apps to download, no logins to remember.
            </p>
          </div>

          <div className="group">
            <div className="mb-6 text-gray-300 group-hover:text-black transition-colors duration-500">
              <Check size={48} strokeWidth={1} />
            </div>
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Step 03</span>
            <h3 className="text-xl font-bold mb-3">Train & Reply</h3>
            <p className="text-gray-600 leading-relaxed">
              Complete the workout anywhere. Reply to your coach anytime for adjustments or advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
