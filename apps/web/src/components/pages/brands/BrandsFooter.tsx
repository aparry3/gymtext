'use client';

import React from 'react';
import Image from 'next/image';

export const BrandsFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Image
            src="/Wordmark.png"
            alt="GymText"
            width={120}
            height={28}
            className="h-7 w-auto"
          />
        </div>
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} GymText. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
