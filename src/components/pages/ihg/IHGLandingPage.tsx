'use client';

import React from 'react';
import IHGNavbar from './IHGNavbar';
import IHGHero from './IHGHero';
import IHGPartnershipIntro from './IHGPartnershipIntro';
import IHGDemoSection from './IHGDemoSection';
import IHGHowItWorks from './IHGHowItWorks';
import IHGTestimonials from './IHGTestimonials';
import IHGFooter from './IHGFooter';

const IHGLandingPage: React.FC = () => {
  return (
    <div className="ihg-page min-h-screen flex flex-col w-full overflow-x-hidden bg-slate-50 text-slate-900 antialiased selection:bg-orange-200 selection:text-orange-900">
      <IHGNavbar />
      <main className="flex-grow">
        <IHGHero />
        <IHGPartnershipIntro />
        <IHGDemoSection />
        <IHGHowItWorks />
        <IHGTestimonials />
      </main>
      <IHGFooter />
    </div>
  );
};

export default IHGLandingPage;
