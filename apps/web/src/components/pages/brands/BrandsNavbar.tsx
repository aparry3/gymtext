'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export const BrandsNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBgClass = scrolled
    ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-3'
    : 'bg-transparent py-6';
  const textColorClass = scrolled ? 'text-gray-900' : 'text-white';
  const buttonClass = scrolled
    ? 'bg-gray-900 text-white hover:bg-gray-800'
    : 'bg-white text-gray-900 hover:bg-gray-100';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <a href="#" className="flex-shrink-0 relative h-8">
              {/* White logo for transparent navbar (on hero) */}
              <Image
                src="/WordmarkWhite.png"
                alt="GymText"
                width={140}
                height={32}
                className={`h-8 w-auto transition-opacity duration-300 ${
                  scrolled ? 'opacity-0' : 'opacity-100'
                }`}
                priority
              />
              {/* Dark logo for scrolled navbar */}
              <Image
                src="/Wordmark.png"
                alt="GymText"
                width={140}
                height={32}
                className={`h-8 w-auto absolute top-0 left-0 transition-opacity duration-300 ${
                  scrolled ? 'opacity-100' : 'opacity-0'
                }`}
                priority
              />
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className={`text-sm font-medium transition-colors hover:opacity-80 ${textColorClass}`}
            >
              Features
            </a>
            <a
              href="#use-cases"
              className={`text-sm font-medium transition-colors hover:opacity-80 ${textColorClass}`}
            >
              Use Cases
            </a>
            <a
              href="#team"
              className={`text-sm font-medium transition-colors hover:opacity-80 ${textColorClass}`}
            >
              Team
            </a>
            <a
              href="mailto:kyle@gymtext.co"
              className={`${buttonClass} px-5 py-2.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-lg`}
            >
              Book Demo
            </a>
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none ${textColorClass}`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <a
              href="#features"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gymblue-600 hover:bg-gray-50 rounded-md"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gymblue-600 hover:bg-gray-50 rounded-md"
            >
              Use Cases
            </a>
            <a
              href="#team"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gymblue-600 hover:bg-gray-50 rounded-md"
            >
              Team
            </a>
            <a
              href="mailto:kyle@gymtext.co"
              className="block w-full text-center mt-4 bg-gray-900 text-white px-5 py-3 rounded-lg font-medium"
            >
              Book Demo
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
