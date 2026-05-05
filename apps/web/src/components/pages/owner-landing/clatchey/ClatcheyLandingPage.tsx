import Image from 'next/image';
import Link from 'next/link';
import { ClatcheyHero, CLATCHEY_SIGNUP_URL } from './ClatcheyHero';
import { ClatcheyStatsBar } from './ClatcheyStatsBar';
import { ClatcheyBioSection } from './ClatcheyBioSection';
import { ClatcheyPlayerShowcase } from './ClatcheyPlayerShowcase';
import { ClatcheyCamp } from './ClatcheyCamp';
import { ClatcheyHowItWorks } from './ClatcheyHowItWorks';
import { ClatcheySmsCoaching } from './ClatcheySmsCoaching';
import { ClatcheyPricing } from './ClatcheyPricing';
import { ClatcheyFAQ } from './ClatcheyFAQ';
import { ClatcheyCTA } from './ClatcheyCTA';
import { ClatcheyFooter } from './ClatcheyFooter';
import { ClatcheyStickyCTA } from './ClatcheyStickyCTA';

export function ClatcheyLandingPage() {
  return (
    <div className="min-h-screen bg-msj-night text-msj-cream">
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 md:px-8 py-5 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/WordmarkWhite.png"
            alt="GymText"
            width={100}
            height={24}
            className="h-6 md:h-7 w-auto"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.18em] text-msj-cream/70 font-semibold">
          <a href="#bio" className="hover:text-msj-cream transition-colors">COACH</a>
          <a href="#proof" className="hover:text-msj-cream transition-colors">PROOF</a>
          <a href="#camp" className="hover:text-msj-cream transition-colors">CAMP</a>
          <a href="#sms" className="hover:text-msj-cream transition-colors">SMS</a>
          <a href="#faq" className="hover:text-msj-cream transition-colors">FAQ</a>
        </div>
        <a
          href={CLATCHEY_SIGNUP_URL}
          className="bg-msj-purple text-msj-cream text-[11px] md:text-xs tracking-[0.18em] font-bold px-4 md:px-5 py-2.5 rounded-full hover:brightness-110 transition-all"
        >
          START $25/MO
        </a>
      </nav>

      <ClatcheyHero />
      <ClatcheyStatsBar />
      <ClatcheyBioSection />
      <ClatcheyPlayerShowcase />
      <ClatcheyCamp />
      <ClatcheyHowItWorks />
      <ClatcheySmsCoaching />
      <ClatcheyPricing />
      <ClatcheyFAQ />
      <ClatcheyCTA />
      <ClatcheyFooter />
      <ClatcheyStickyCTA />
    </div>
  );
}
