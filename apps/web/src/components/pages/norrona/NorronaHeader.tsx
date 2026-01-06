'use client';

import React, { useState, useEffect } from 'react';

export const NorronaHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white text-black py-4 shadow-sm' : 'bg-transparent text-white py-6'}`}>
      <div className="px-6 md:px-12 max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase">Norrøna</span>
          <span className="text-lg opacity-50">×</span>
          <span className={`text-lg md:text-xl font-bold tracking-tighter uppercase italic ${scrolled ? 'text-gymtext-blue' : 'text-white'}`}>Gymtext</span>
        </div>

        {/* Nav / CTA */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#programs" className="uppercase text-xs font-bold tracking-widest hover:opacity-70 transition-opacity">Programs</a>
          <a href="#programs" className={`border ${scrolled ? 'border-black hover:bg-black hover:text-white' : 'border-white hover:bg-white hover:text-black'} px-6 py-2 uppercase text-xs font-bold tracking-widest transition-colors`}>
            Start Training
          </a>
        </nav>

        {/* Mobile Menu Icon (Visual only for landing page) */}
        <div className="md:hidden">
            <div className={`space-y-1.5 cursor-pointer`}>
                <span className={`block w-6 h-0.5 ${scrolled ? 'bg-black' : 'bg-white'}`}></span>
                <span className={`block w-6 h-0.5 ${scrolled ? 'bg-black' : 'bg-white'}`}></span>
            </div>
        </div>
      </div>
    </header>
  );
};
