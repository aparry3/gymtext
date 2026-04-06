import type { Metadata } from 'next';
import { MikeyLandingPage } from '@/components/pages/owner-landing/MikeyLandingPage';
import './mikey.css';

export const metadata: Metadata = {
  title: 'Train with Mikey Swiercz | GymText',
  description:
    'Get training from former All-American and National Champion Mikey Swiercz. Johns Hopkins All-Decade team, U.S. Open Cup champion. Workouts delivered via SMS.',
  openGraph: {
    title: 'Train with Mikey Swiercz | GymText',
    description:
      'Get training from former All-American and National Champion Mikey Swiercz. Johns Hopkins All-Decade team, U.S. Open Cup champion.',
    type: 'website',
  },
};

export default function MikeyPage() {
  return <MikeyLandingPage />;
}
