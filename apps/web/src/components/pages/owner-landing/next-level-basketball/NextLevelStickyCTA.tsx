'use client';

import { useState, useEffect } from 'react';

export function NextLevelStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-nlb-dark border-t border-white/10 shadow-2xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-white/50 font-bold uppercase">
            May 29 – 30
          </p>
          <p className="text-sm font-bold text-white">Memphis · Coach Henry</p>
        </div>
        <a
          href="#pricing"
          className="bg-nlb-orange text-white px-5 py-3 rounded-full font-bold text-xs tracking-[0.2em] hover:brightness-110 transition-all"
        >
          RESERVE
        </a>
      </div>
    </div>
  );
}
