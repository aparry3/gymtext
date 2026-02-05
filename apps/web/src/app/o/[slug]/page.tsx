import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServices } from '@/lib/context';
import { ClatcheyLandingPage } from '@/components/pages/owner-landing/ClatcheyLandingPage';
import './clatchey.css';

interface OwnerLandingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OwnerLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const services = getServices();
  const owner = await services.programOwner.getBySlug(slug);

  if (!owner || !owner.isActive) {
    return {
      title: 'Not Found | GymText',
    };
  }

  // For now, hardcode Pat Clatchey metadata
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

  return {
    title: `Train with ${owner.displayName} | GymText`,
    description: owner.bio || `Get personalized training from ${owner.displayName} delivered via SMS.`,
  };
}

export default async function OwnerLandingPage({ params }: OwnerLandingPageProps) {
  const { slug } = await params;
  const services = getServices();

  const owner = await services.programOwner.getBySlug(slug);

  if (!owner || !owner.isActive) {
    notFound();
  }

  // For now, only render the Clatchey landing page
  if (slug === 'coachclatchey') {
    return <ClatcheyLandingPage owner={owner} />;
  }

  // Future: Support different owner templates based on ownerType
  notFound();
}
