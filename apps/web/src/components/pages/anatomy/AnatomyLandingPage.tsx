'use client';

import React from 'react';
import AnatomyNavbar from './AnatomyNavbar';
import AnatomyHero from './AnatomyHero';
import AnatomyPartnership from './AnatomyPartnership';
import AnatomyPillars from './AnatomyPillars';
import AnatomyFeatures from './AnatomyFeatures';
import AnatomyMembers from './AnatomyMembers';
import AnatomyHowItWorks from './AnatomyHowItWorks';
import AnatomyTestimonials from './AnatomyTestimonials';
import AnatomyCta from './AnatomyCta';
import AnatomyPlans from './AnatomyPlans';
import AnatomyFaq from './AnatomyFaq';
import AnatomyContact from './AnatomyContact';
import AnatomyFooter from './AnatomyFooter';

const AnatomyLandingPage: React.FC = () => {
  return (
    <div className="anatomy-page min-h-screen flex flex-col w-full overflow-x-hidden bg-anatomy-black text-white antialiased">
      <AnatomyNavbar />
      <main className="flex-grow">
        <AnatomyHero />
        <AnatomyPartnership />
        <AnatomyPillars />
        <AnatomyFeatures />
        <AnatomyMembers />
        <AnatomyHowItWorks />
        <AnatomyTestimonials />
        <AnatomyCta />
        <AnatomyPlans />
        <AnatomyFaq />
        <AnatomyContact />
      </main>
      <AnatomyFooter />
    </div>
  );
};

export default AnatomyLandingPage;
