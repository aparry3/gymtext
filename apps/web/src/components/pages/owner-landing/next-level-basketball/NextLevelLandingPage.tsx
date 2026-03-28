'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NextLevelHero } from './NextLevelHero';
import { NextLevelStatsBar } from './NextLevelStatsBar';
import { NextLevelBioSection } from './NextLevelBioSection';
import { NextLevelTestimonials } from './NextLevelTestimonials';
import { NextLevelPrograms } from './NextLevelPrograms';
import { NextLevelCTA } from './NextLevelCTA';
import { NextLevelStickyCTA } from './NextLevelStickyCTA';
import { NextLevelFooter } from './NextLevelFooter';

interface NextLevelLandingPageProps {
  startUrl?: string;
}

export function NextLevelLandingPage({ startUrl = '/start' }: NextLevelLandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Overlay */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center container mx-auto">
        <Link href="/" className="text-white font-bold text-2xl tracking-tighter">
          <Image
            src="/WordmarkWhite.png"
            alt="GymText"
            width={100}
            height={24}
            className="h-6 md:h-7 w-auto"
          />
        </Link>
        <Link
          href={startUrl}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-white hover:text-black transition-all"
        >
          Get Started
        </Link>
      </nav>

      <NextLevelHero startUrl={startUrl} />
      <NextLevelStatsBar />
      <NextLevelBioSection />
      <NextLevelPrograms startUrl={startUrl} />
      <NextLevelTestimonials />
      <NextLevelCTA startUrl={startUrl} />
      <NextLevelFooter />
      <NextLevelStickyCTA startUrl={startUrl} />
    </div>
  );
}
