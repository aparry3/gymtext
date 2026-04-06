import type { Metadata } from 'next';
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/ClatcheyLandingPage';
import './clatchey.css';

export const metadata: Metadata = {
  title: 'Train with Coach Pat Clatchey | GymText Legend Series',
  description:
    'Get championship-caliber basketball training from future Hall of Famer Pat Clatchey. 850+ wins, 3 NBA players developed, 70+ NCAA athletes. Workouts delivered via SMS.',
  openGraph: {
    title: 'Train with Coach Pat Clatchey | GymText Legend Series',
    description:
      'Get championship-caliber basketball training from future Hall of Famer Pat Clatchey. 850+ wins, 3 NBA players developed.',
    type: 'website',
  },
};

export default function ClatcheyPage() {
  return <ClatcheyLandingPage />;
}
