import { Metadata } from 'next';
import WorkoutSetupClient from './WorkoutSetupClient';

export const metadata: Metadata = {
  title: 'Welcome to GYMTEXT!',
  description: 'Welcome to GYMTEXT! Your personalized fitness journey starts now.',
};

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <WorkoutSetupClient />
    </main>
  );
} 