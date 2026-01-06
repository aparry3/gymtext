'use client';

import React from 'react';
import { NorronaHeader } from './NorronaHeader';
import { NorronaHero } from './NorronaHero';
import { NorronaHowItWorks } from './NorronaHowItWorks';
import { NorronaPrograms } from './NorronaPrograms';
import { NorronaPhilosophy } from './NorronaPhilosophy';
import { NorronaFooter } from './NorronaFooter';

const NorronaLandingPage: React.FC = () => {
  return (
    <div className="norrona-page min-h-screen flex flex-col w-full overflow-x-hidden bg-white text-norr-black antialiased">
      <NorronaHeader />
      <main className="flex-grow">
        <NorronaHero />
        <NorronaHowItWorks />
        <NorronaPrograms />
        <NorronaPhilosophy />
      </main>
      <NorronaFooter />
    </div>
  );
};

export default NorronaLandingPage;
