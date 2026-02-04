'use client';

import type { ProgramOwner } from '@gymtext/shared/server';
import Image from 'next/image';
import Link from 'next/link';
import { ClatcheyHero } from './ClatcheyHero';
import { ClatcheyStatsBar } from './ClatcheyStatsBar';
import { ClatcheyBioSection } from './ClatcheyBioSection';
import { ClatcheyPlayerShowcase } from './ClatcheyPlayerShowcase';
import { ClatcheyProgramTracks } from './ClatcheyProgramTracks';
import { ClatcheyCTA } from './ClatcheyCTA';
import { ClatcheyStickyCTA } from './ClatcheyStickyCTA';
import { ClatcheyFooter } from './ClatcheyFooter';

interface ClatcheyLandingPageProps {
  owner: ProgramOwner;
}

export function ClatcheyLandingPage({ owner }: ClatcheyLandingPageProps) {
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
          href="/start"
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold hover:bg-white hover:text-black transition-all"
        >
          Get Started
        </Link>
      </nav>

      <ClatcheyHero />
      <ClatcheyStatsBar />
      <ClatcheyBioSection owner={owner} />
      <ClatcheyPlayerShowcase />
      <ClatcheyProgramTracks />
      <ClatcheyCTA />
      <ClatcheyFooter />
      <ClatcheyStickyCTA />
    </div>
  );
}
