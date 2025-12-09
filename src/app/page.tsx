import { Metadata } from 'next';
import { LandingPage } from '@/components/pages/landing/LandingPage';

export const metadata: Metadata = {
  title: 'GymText - 24/7 Personal Training via Text Message',
  description:
    'Get personalized workouts, 24/7 coaching, and real results - all through simple text messages. No app downloads, no gym required. Just $19.99/month.',
  keywords:
    'fitness coaching, personal training, text message coaching, workout plans, fitness goals, online personal trainer, affordable training',
  openGraph: {
    title: 'GymText - 24/7 Personal Training via Text Message',
    description:
      'Your personal trainer, always in your pocket. Get personalized workouts and 24/7 coaching via text for just $19.99/month.',
    type: 'website',
    url: 'https://gymtext.com',
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;
  if (params.source) {
    console.log('[Landing] Source:', params.source);
  }
  return <LandingPage />;
}
