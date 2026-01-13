'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './constants';
import Button from './Button';

const AnatomyNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-anatomy-black/95 backdrop-blur-md border-b border-zinc-900 py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo Lockup */}
        <a href="#hero" className="flex flex-row items-center gap-3 group">
          <img
            src="https://anatomyfitness.com/wp-content/uploads/2022/06/logo_tm.png"
            alt="Anatomy"
            className="h-6 md:h-8 w-auto"
          />
          <span className="text-zinc-500 text-sm">×</span>
          <img
            src="/Wordmark.png"
            alt="GymText"
            className="h-5 md:h-6 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="https://anatomyfitness.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold uppercase tracking-widest text-white hover:text-zinc-300 border-b border-transparent hover:border-zinc-300 transition-all"
          >
            Join Anatomy
          </a>
          <Button variant="primary" href="#plans" className="!py-3 !px-6 !text-xs">
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 top-[72px] bg-anatomy-black z-40 flex flex-col p-8 space-y-8 animate-slide-in-from-right">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="text-2xl font-bold uppercase tracking-widest text-white"
            >
              {item.label}
            </a>
          ))}
          <div className="h-px bg-zinc-800 w-full my-8"></div>
          <a
            href="#plans"
            onClick={handleNavClick}
            className="text-xl font-bold uppercase tracking-widest text-zinc-400"
          >
            Get Started
          </a>
          <a
            href="https://anatomyfitness.com"
            target="_blank"
            rel="noreferrer"
            className="text-xl font-bold uppercase tracking-widest text-zinc-400"
          >
            Join Anatomy
          </a>
        </div>
      )}
    </nav>
  );
};

export default AnatomyNavbar;
