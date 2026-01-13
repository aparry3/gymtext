'use client';

import React from 'react';
import { Instagram, Twitter, Facebook, MapPin } from 'lucide-react';

const AnatomyFooter: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-20 pb-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-row items-center gap-3 mb-6">
              <img
                src="https://anatomyfitness.com/wp-content/uploads/2022/06/logo_tm.png"
                alt="Anatomy"
                className="h-8 md:h-10 w-auto"
              />
              <span className="text-zinc-500 text-lg">×</span>
              <img
                src="/Wordmark.png"
                alt="GymText"
                className="h-6 md:h-7 w-auto opacity-80"
              />
            </div>
            <p className="text-zinc-400 max-w-md font-light leading-relaxed">
              The future of training is here. Anatomy-level programming delivered directly to your phone, anywhere in the world.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Explore</h4>
            <ul className="space-y-4">
              <li><a href="#how-it-works" className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-wide">How It Works</a></li>
              <li><a href="#plans" className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-wide">Plans</a></li>
              <li><a href="#faq" className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-wide">FAQ</a></li>
              <li><a href="#contact" className="text-zinc-500 hover:text-white transition-colors text-sm uppercase tracking-wide">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Connect</h4>
            <div className="flex space-x-6 mb-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Facebook size={20} /></a>
            </div>
            <div className="flex items-start gap-2 text-zinc-500 text-sm">
              <MapPin size={16} className="mt-1 flex-shrink-0" />
              <span>Miami Beach &bull; Midtown &bull; Coconut Grove &bull; Doral &bull; Nashville</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Anatomy x GymText Partnership. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-wider">Privacy</a>
            <a href="#" className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-wider">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AnatomyFooter;
