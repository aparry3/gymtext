'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { HeroSection } from '@/components/pages/landing/HeroSection';
import { HowItWorksSection } from '@/components/pages/landing/HowItWorksSection';
import { SMSPreviewSection } from '@/components/pages/landing/SMSPreviewSection';
import { FeaturesSection } from '@/components/pages/landing/FeaturesSection';
import { CTASection } from '@/components/pages/landing/CTASection';
import { FooterSection } from '@/components/pages/landing/FooterSection';

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <main className="landing-dark min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled || isMobileMenuOpen
            ? 'bg-slate-950/90 backdrop-blur-md border-slate-800 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/WordmarkWhite.png"
              alt="GymText"
              width={135}
              height={30}
              className="h-[30px] w-auto"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors"
            >
              Why GymText
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="hover:text-white transition-colors"
            >
              Demo
            </button>
            <Link
              href="/start"
              className="text-white hover:opacity-80 transition-all font-semibold"
            >
              Start Training
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-6 shadow-2xl">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-lg text-slate-300 hover:text-white text-left"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-lg text-slate-300 hover:text-white text-left"
            >
              Why GymText
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="text-lg text-slate-300 hover:text-white text-left"
            >
              Demo
            </button>
            <Link
              href="/start"
              className="bg-[#1B81FF] text-white px-6 py-4 rounded-xl font-bold text-center w-full"
            >
              Start Training
            </Link>
          </div>
        )}
      </nav>

      <HeroSection onScrollToSection={scrollToSection} />
      <HowItWorksSection />
      <SMSPreviewSection />
      <FeaturesSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
