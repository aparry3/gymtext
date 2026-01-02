'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { GymTextWordmark } from './GymTextLogo';
import { EvenLogo } from './EvenLogo';

const IHGNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center space-x-6">
          <EvenLogo variant={isScrolled ? 'color' : 'white'} className="h-10" />
          <div className={`h-8 w-px ${isScrolled ? 'bg-slate-300' : 'bg-white/40'}`}></div>
          <GymTextWordmark
            className="h-8"
            variant={isScrolled ? 'color' : 'white'}
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {['Wellness Your Way', 'The GymText Experience', 'Stay Well', 'Find a Hotel'].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-sm font-semibold tracking-wide transition-colors hover:text-emerald-500 uppercase ${
                isScrolled ? 'text-slate-700' : 'text-white/95'
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              isScrolled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                : 'bg-white text-emerald-900 hover:bg-gray-100 shadow-xl'
            }`}
          >
            Keep Your Balance
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={isScrolled ? 'text-slate-900' : 'text-white'} />
          ) : (
            <Menu className={isScrolled ? 'text-slate-900' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-6 lg:hidden flex flex-col space-y-4 animate-fade-in-down">
          {['Wellness Your Way', 'The GymText Experience', 'Stay Well', 'Find a Hotel'].map((item) => (
            <a key={item} href="#" className="text-slate-800 font-bold py-2 border-b border-gray-50 uppercase text-sm tracking-wider">
              {item}
            </a>
          ))}
          <button className="w-full bg-emerald-600 text-white py-4 rounded-lg font-bold uppercase tracking-widest mt-4">
            Keep Your Balance
          </button>
        </div>
      )}
    </nav>
  );
};

export default IHGNavbar;
