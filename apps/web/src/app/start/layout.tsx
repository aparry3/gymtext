import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | GymText',
  description: 'Start your personalized fitness journey with GymText',
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
