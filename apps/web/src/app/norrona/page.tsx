import { Metadata } from 'next';
import NorronaLandingPage from '@/components/pages/norrona/NorronaLandingPage';
import './norrona.css';

export const metadata: Metadata = {
  title: 'Norrøna × Gymtext | Train for the Mountains',
  description: 'Professional ski and hiking coaching delivered directly to your messages. One text at a time.',
  openGraph: {
    title: 'Norrøna × Gymtext | Train for the Mountains',
    description: 'Professional ski and hiking coaching delivered directly to your messages. One text at a time.',
    type: 'website',
  },
};

export default function NorronaPage() {
  return <NorronaLandingPage />;
}
