'use client';

import { useState, useEffect } from 'react';
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';

export function ClatcheyStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-msj-night border-t border-msj-cream/10 shadow-2xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-msj-cream/50 font-bold uppercase">
            Coach Clatchey · $25/mo
          </p>
          <p className="text-sm font-bold text-msj-cream">Daily SMS coaching</p>
        </div>
        <a
          href={CLATCHEY_SIGNUP_URL}
          className="bg-msj-purple text-msj-cream px-5 py-3 rounded-full font-bold text-xs tracking-[0.2em] hover:brightness-110 transition-all"
        >
          START
        </a>
      </div>
    </div>
  );
}
