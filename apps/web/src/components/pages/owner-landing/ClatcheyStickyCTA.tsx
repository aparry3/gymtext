'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function ClatcheyStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Coach Clatchey</p>
          <p className="text-sm font-bold text-msj-purple">GymText Access</p>
        </div>
        <Link
          href="/start"
          className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-gray-800 transition-colors"
        >
          Get Workouts
        </Link>
      </div>
    </div>
  );
}
