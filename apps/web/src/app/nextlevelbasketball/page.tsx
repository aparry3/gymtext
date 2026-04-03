import type { Metadata } from 'next';
import { NextLevelLandingPage } from '@/components/pages/owner-landing/next-level-basketball';
import { getRepositories } from '@/lib/context';
import './next-level.css';

export const metadata: Metadata = {
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

export default async function NextLevelBasketballPage() {
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
