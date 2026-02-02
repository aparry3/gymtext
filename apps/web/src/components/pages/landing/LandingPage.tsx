'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { HeroSection } from '@/components/pages/landing/HeroSection';
import { HowItWorksSection } from '@/components/pages/landing/HowItWorksSection';
import { SMSPreviewSection } from '@/components/pages/landing/SMSPreviewSection';
import { FeaturesSection } from '@/components/pages/landing/FeaturesSection';
import { CTASection } from '@/components/pages/landing/CTASection';
import { FooterSection } from '@/components/pages/landing/FooterSection';

export type Theme = 'light' | 'dark';

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

  const isLight = theme === 'light';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <main className={`min-h-screen flex flex-col font-sans ${isLight ? 'bg-white' : 'landing-dark'}`}>
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled || isMobileMenuOpen
            ? isLight
              ? 'bg-white/90 backdrop-blur-md border-gray-200 py-3'
              : 'bg-slate-950/90 backdrop-blur-md border-slate-800 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src={isLight ? '/Wordmark.png' : '/WordmarkWhite.png'}
              alt="GymText"
              width={135}
              height={30}
              className="h-[30px] w-auto"
            />
          </div>

          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors ${
            isLight && isScrolled ? 'text-gray-600' : 'text-white'
          }`}>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`transition-colors ${isLight && isScrolled ? 'hover:text-gray-900' : 'hover:text-white/80'}`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`transition-colors ${isLight && isScrolled ? 'hover:text-gray-900' : 'hover:text-white/80'}`}
            >
              Why GymText
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className={`transition-colors ${isLight && isScrolled ? 'hover:text-gray-900' : 'hover:text-white/80'}`}
            >
              Demo
            </button>
            <Link
              href="/blog"
              className={`transition-colors ${isLight && isScrolled ? 'hover:text-gray-900' : 'hover:text-white/80'}`}
            >
              Blog
            </Link>
            <Link
              href="/start"
              className="bg-[#1B81FF] hover:bg-[#1468CC] text-white px-5 py-2 rounded-full font-semibold transition-all"
            >
              Start Training
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ${isLight && isScrolled ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 w-full p-6 flex flex-col gap-6 shadow-2xl ${
            isLight
              ? 'bg-white border-b border-gray-200'
              : 'bg-slate-950 border-b border-slate-800'
          }`}>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`text-lg text-left ${
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`text-lg text-left ${
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Why GymText
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className={`text-lg text-left ${
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Demo
            </button>
            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg text-left ${
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Blog
            </Link>
            <Link
              href="/start"
              className="bg-[#1B81FF] text-white px-6 py-4 rounded-xl font-bold text-center w-full"
            >
              Start Training
            </Link>
          </div>
        )}
      </nav>

      <HeroSection onScrollToSection={scrollToSection} theme={theme} />
      <SMSPreviewSection theme={theme} />
      <HowItWorksSection theme={theme} />
      <FeaturesSection theme={theme} />
      <CTASection theme={theme} />

      {/* Theme Toggle */}
      <div className={`py-8 text-center ${isLight ? 'bg-gray-50' : 'bg-slate-950'}`}>
        <button
          onClick={toggleTheme}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            isLight
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
          Switch to {isLight ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      <FooterSection theme={theme} />
    </main>
  );
}
