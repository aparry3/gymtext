'use client';

import React from 'react';
import { BrandsNavbar } from './BrandsNavbar';
import { BrandsHeroCarousel } from './BrandsHeroCarousel';
import { BrandsPhoneDemo } from './BrandsPhoneDemo';
import { BrandsFeatures } from './BrandsFeatures';
import { BrandsUseCases } from './BrandsUseCases';
import { BrandsTeam } from './BrandsTeam';
import { BrandsFooter } from './BrandsFooter';

const BrandsLandingPage: React.FC = () => {
  return (
    <div className="brands-page min-h-screen bg-white text-gray-900 selection:bg-gymblue-100 selection:text-gymblue-900">
      <BrandsNavbar />
      <main>
        <BrandsHeroCarousel />
        <BrandsPhoneDemo />
        <BrandsFeatures />
        <BrandsUseCases />
        <BrandsTeam />
      </main>
      <BrandsFooter />
    </div>
  );
};

export default BrandsLandingPage;
