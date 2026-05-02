import Image from 'next/image';
import { NextLevelHero } from './NextLevelHero';
import { NextLevelStatsBar } from './NextLevelStatsBar';
import { NextLevelCampDays, NextLevelPricing } from './NextLevelPrograms';
import { NextLevelBioSection } from './NextLevelBioSection';
import { NextLevelHowItWorks } from './NextLevelTestimonials';
import { NextLevelSmsCoaching, NextLevelCTA } from './NextLevelCTA';
import { NextLevelFAQ } from './NextLevelFAQ';
import { NextLevelStickyCTA } from './NextLevelStickyCTA';
import { NextLevelFooter } from './NextLevelFooter';

export function NextLevelLandingPage() {
  return (
    <div className="min-h-screen bg-nlb-dark text-white">
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 md:px-8 py-5 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/NextLevelLogo.png"
            alt="Next Level Basketball"
            width={400}
            height={160}
            className="h-9 md:h-11 w-auto invert"
            priority
          />
        </div>
        <div className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.18em] text-white/70 font-semibold">
          <a href="#schedule" className="hover:text-white transition-colors">SCHEDULE</a>
          <a href="#coach" className="hover:text-white transition-colors">COACH</a>
          <a href="#pricing" className="hover:text-white transition-colors">PRICING</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <a
          href="#pricing"
          className="bg-nlb-orange text-white text-[11px] md:text-xs tracking-[0.18em] font-bold px-4 md:px-5 py-2.5 rounded-full hover:brightness-110 transition-all"
        >
          RESERVE SPOT
        </a>
      </nav>

      <NextLevelHero />
      <NextLevelStatsBar />
      <NextLevelCampDays />
      <NextLevelBioSection />
      <NextLevelHowItWorks />
      <NextLevelPricing />
      <NextLevelSmsCoaching />
      <NextLevelFAQ />
      <NextLevelCTA />
      <NextLevelFooter />
      <NextLevelStickyCTA />
    </div>
  );
}
