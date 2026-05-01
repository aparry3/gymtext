import type { Metadata } from 'next';
import { NextLevelLandingPage } from '@/components/pages/owner-landing/next-level-basketball';
import './next-level.css';

const TITLE = 'Next Level Basketball Camp · May 29-30 · Memphis, TN';
const DESCRIPTION =
  'Two days in the gym with Coach Rhynia Henry, plus daily SMS workouts that keep showing up after he goes home. Memphis, May 29-30, 2026.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
};

export default function NextLevelBasketballPage() {
  return <NextLevelLandingPage />;
}
