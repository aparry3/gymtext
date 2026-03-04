import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/ClatcheyLandingPage';
import { MikeyLandingPage } from '@/components/pages/owner-landing/MikeyLandingPage';
import './clatchey.css';
import './mikey.css';

interface OwnerLandingPageProps {
  params: Promise<{ slug: string }>;
}

const OWNER_PAGES: Record<string, { displayName: string; avatarUrl: string }> = {
  coachclatchey: {
    displayName: 'Coach Pat Clatchey',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop',
  },
};

export async function generateMetadata({ params }: OwnerLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const owner = OWNER_PAGES[slug];

  if (!owner) {
    return {
      title: 'Not Found | GymText',
    };
  }

  if (slug === 'coachclatchey') {
    return {
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
  }

  if (slug === 'mikeyswiercz') {
    return {
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
  }

  return {
    title: `Train with ${owner.displayName} | GymText`,
    description: `Get personalized training from ${owner.displayName} delivered via SMS.`,
  };
}

export default async function OwnerLandingPage({ params }: OwnerLandingPageProps) {
  const { slug } = await params;

  if (!OWNER_PAGES[slug]) {
    notFound();
  }

  // For now, only render specific coach landing pages
  if (slug === 'coachclatchey') {
    return <ClatcheyLandingPage />;
  }

  if (slug === 'mikeyswiercz') {
    return <MikeyLandingPage />;
  }

  // Future: Support different owner templates based on ownerType
  notFound();
}
