import { Metadata } from 'next';
import AnatomyLandingPage from '@/components/pages/anatomy/AnatomyLandingPage';
import './anatomy.css';

export const metadata: Metadata = {
  title: 'Anatomy × GymText | The Future of Training',
  description: 'Professional fitness coaching delivered directly to your messages. Personalized training plans for Anatomy members.',
  openGraph: {
    title: 'Anatomy × GymText | The Future of Training',
    description: 'Professional fitness coaching delivered directly to your messages.',
    type: 'website',
  },
};

export default function AnatomyPage() {
  return <AnatomyLandingPage />;
}
