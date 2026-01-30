'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Theme } from './LandingPage';

interface FooterSectionProps {
  theme?: Theme;
}

export function FooterSection({ theme = 'dark' }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();
  const isLight = theme === 'light';

  return (
    <footer className={`py-12 ${
      isLight
        ? 'bg-white border-t border-gray-200'
        : 'bg-slate-950 border-t border-slate-900'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src={isLight ? '/Wordmark.png' : '/WordmarkWhite.png'}
              alt="GymText"
              width={135}
              height={30}
              className="h-[30px] w-auto"
            />
          </div>

          <div className={`flex gap-8 text-sm ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
            <Link
              href="/privacy"
              className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}
            >
              Terms
            </Link>
            <Link
              href="mailto:support@gymtext.co"
              className={`transition-colors ${isLight ? 'hover:text-gray-900' : 'hover:text-white'}`}
            >
              Contact
            </Link>
          </div>

          <div className={`text-sm ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>
            © {currentYear} GymText Co. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
