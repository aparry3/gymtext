import { Metadata } from 'next';
import { LandingPage } from '@/components/pages/landing/LandingPage';

export const metadata: Metadata = {
  title: 'GymText - 24/7 AI Personal Training via Text Message',
  description:
    'Get personalized workouts, 24/7 AI coaching, and real results - all through simple text messages. No app downloads, no gym required. Just $7.99/month.',
  keywords:
    'AI fitness coaching, personal training, text message coaching, workout plans, fitness goals, AI personal trainer, affordable training',
  openGraph: {
    title: 'GymText - 24/7 AI Personal Training via Text Message',
    description:
      'Your AI personal trainer, always in your pocket. Get personalized workouts and 24/7 AI coaching via text for just $7.99/month.',
    type: 'website',
    url: 'https://gymtext.co',
  },
};

// Page visits are now tracked centrally via middleware
export default async function Home() {
  return <LandingPage />;
}
