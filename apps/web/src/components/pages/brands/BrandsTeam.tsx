'use client';

import React from 'react';
import { Mail } from 'lucide-react';

export const BrandsTeam: React.FC = () => {
  return (
    <section id="team" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Ready to explore a partnership? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-gymblue-100 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-gymblue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Contact Us
            </h3>
            <p className="text-gray-500 mb-6">
              Reach out to discuss partnership opportunities
            </p>
            <a
              href="mailto:admin@gymtext.co"
              className="inline-flex items-center gap-2 text-base font-medium text-white bg-gymblue-600 hover:bg-gymblue-700 transition-colors py-3 px-6 rounded-full"
            >
              <Mail className="h-5 w-5" />
              admin@gymtext.co
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
