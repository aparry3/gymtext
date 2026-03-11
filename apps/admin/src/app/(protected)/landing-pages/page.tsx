'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { ExternalLink } from 'lucide-react';

interface LandingPage {
  name: string;
  path: string;
  description: string;
  type: 'coach' | 'brand' | 'b2b';
}

const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_URL || 'https://gymtext.co';

const LANDING_PAGES: LandingPage[] = [
  {
    name: 'Coach Pat Clatchey',
    path: '/o/coachclatchey',
    description: 'Basketball coaching — Legend Series',
    type: 'coach',
  },
  {
    name: 'Mikey Swiercz',
    path: '/o/mikeyswiercz',
    description: 'Soccer training — Johns Hopkins All-American',
    type: 'coach',
  },
  {
    name: 'Coach Rhynia Henry',
    path: '/o/nextlevelbasketball',
    description: 'Next Level Basketball Training & Development',
    type: 'coach',
  },
  {
    name: 'IHG x GymText',
    path: '/ihg',
    description: 'EVEN Hotels partnership — in-room wellness',
    type: 'brand',
  },
  {
    name: 'Norrona x GymText',
    path: '/norrona',
    description: 'Ski & hiking coaching partnership',
    type: 'brand',
  },
  {
    name: 'GymText for Brands',
    path: '/brands',
    description: 'B2B fitness engagement platform',
    type: 'b2b',
  },
];

const TYPE_LABELS: Record<LandingPage['type'], string> = {
  coach: 'Coach',
  brand: 'Brand',
  b2b: 'B2B',
};

const TYPE_COLORS: Record<LandingPage['type'], string> = {
  coach: 'bg-blue-100 text-blue-700',
  brand: 'bg-purple-100 text-purple-700',
  b2b: 'bg-green-100 text-green-700',
};

export default function LandingPagesDirectory() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <AdminHeader
          title="Landing Pages"
          subtitle="All public-facing landing pages on gymtext.co"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANDING_PAGES.map((page) => (
            <a
              key={page.path}
              href={`${WEB_BASE_URL}${page.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[page.type]}`}
                >
                  {TYPE_LABELS[page.type]}
                </span>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{page.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{page.description}</p>
              <code className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                {page.path}
              </code>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
