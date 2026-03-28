import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/ClatcheyLandingPage';
import { MikeyLandingPage } from '@/components/pages/owner-landing/MikeyLandingPage';
import { NextLevelLandingPage } from '@/components/pages/owner-landing/next-level-basketball';
import { getRepositories } from '@/lib/context';
import './clatchey.css';
import './mikey.css';
import './next-level.css';

interface OwnerLandingPageProps {
  params: Promise<{ slug: string }>;
}

const OWNER_PAGES: Record<string, { displayName: string; avatarUrl: string }> = {
  coachclatchey: {
    displayName: 'Coach Pat Clatchey',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop',
  },
  mikeyswiercz: {
    displayName: 'Mikey Swiercz',
    avatarUrl: '/coaches/mikey-swiercz/Hopkins-Cp.JPG',
  },
  nextlevelbasketball: {
    displayName: 'Coach Rhynia Henry',
    avatarUrl: '/coaches/next-level/rhynia-henry.jpg',
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

  if (slug === 'nextlevelbasketball') {
    return {
      title: 'Train with Coach Rhynia Henry | Next Level Basketball x GymText',
      description:
        'Get elite basketball skills training from AFAA-certified trainer Rhynia Henry. Fundamentals, conditioning, and the signature FIRE Workout — delivered via SMS.',
      openGraph: {
        title: 'Train with Coach Rhynia Henry | Next Level Basketball x GymText',
        description:
          'Elite basketball skills development from certified trainer Rhynia Henry. Fundamentals-first training delivered to your phone.',
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
  const owner = OWNER_PAGES[slug];

  if (!owner) {
    notFound();
  }

  if (slug === 'coachclatchey') {
    return <ClatcheyLandingPage />;
  }

  if (slug === 'mikeyswiercz') {
    return <MikeyLandingPage />;
  }

  if (slug === 'nextlevelbasketball') {
    let startUrl = '/start';
    try {
      const repos = getRepositories();
      const programOwner = await repos.programOwner.findBySlug('nextlevelbasketball');
      if (programOwner) {
        const programs = await repos.program.findByOwnerId(programOwner.id);
        const activeProgram = programs.find((p) => p.isActive) ?? programs[0];
        if (activeProgram) {
          startUrl = `/start?program=${activeProgram.id}`;
        }
      }
    } catch {
      // Fall back to /start if DB lookup fails
    }
    return <NextLevelLandingPage startUrl={startUrl} />;
  }

  notFound();
}
