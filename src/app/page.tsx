import { Metadata } from 'next';
import { headers } from 'next/headers';
import { LandingPage } from '@/components/pages/landing/LandingPage';
import { PageVisitRepository } from '@/server/repositories/pageVisitRepository';

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

interface HomeSearchParams {
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const headersList = await headers();

  // Fire-and-forget tracking (don't await to avoid blocking render)
  const repository = new PageVisitRepository();
  repository
    .record({
      page: 'home',
      ipAddress:
        headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
        headersList.get('x-real-ip') ??
        null,
      userAgent: headersList.get('user-agent') ?? null,
      referrer: headersList.get('referer') ?? null,
      source: params.source ?? null,
      utmSource: params.utm_source ?? null,
      utmMedium: params.utm_medium ?? null,
      utmCampaign: params.utm_campaign ?? null,
      utmContent: params.utm_content ?? null,
      utmTerm: params.utm_term ?? null,
    })
    .catch((err) => console.error('[Tracking] Error:', err));

  return <LandingPage />;
}
