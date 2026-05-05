import type { Metadata } from 'next';
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/clatchey';
import './clatchey.css';

const TITLE = 'Coach Pat Clatchey · Daily SMS Coaching · GymText';
const DESCRIPTION =
  '30 years of winning, now on your phone. Daily SMS basketball coaching from Hall-of-Fame coach Pat Clatchey — 850+ wins, 3 NBA players, 70+ NCAA Division I athletes. $25/mo. Cancel anytime.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ClatcheyPage() {
  return <ClatcheyLandingPage />;
}
