import type { Metadata } from 'next';
import { NextLevelLandingPage } from '@/components/pages/owner-landing/next-level-basketball';
import './next-level.css';

const TITLE = 'Next Level Basketball Camp · May 29-30 · Memphis, TN';
const DESCRIPTION =
  'Two days in the gym with Coach Rhynia Henry, plus daily SMS workouts that keep showing up after he goes home. Memphis, May 29-30, 2026.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    images: [
      'https://1ozfgznamn324hl7.public.blob.vercel-storage.com/programs/01c8cee2-49ce-4972-9b8a-48ef66321191/sms-image-generated-1777915820910.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      'https://1ozfgznamn324hl7.public.blob.vercel-storage.com/programs/01c8cee2-49ce-4972-9b8a-48ef66321191/sms-image-generated-1777915820910.png',
    ],
  },
};

export default function NextLevelBasketballPage() {
  return <NextLevelLandingPage />;
}
