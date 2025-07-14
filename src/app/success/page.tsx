import { Metadata } from 'next';
import { isAuthenticated, getUserFromCookie } from '@/shared/utils/cookies';
import { redirect } from 'next/navigation';
import WorkoutSetupClient from './workoutSetupClient';

export const metadata: Metadata = {
  title: 'Payment Successful - GYMTEXT',
  description: 'Your payment was successful. Welcome to GYMTEXT!',
};

export default async function SuccessPage() {
  
  // Check if user is authenticated
  const isAuth = await isAuthenticated();
  const userData = await getUserFromCookie();
  
  console.log('isAuth', isAuth);
  console.log('userData', userData);
  // If not authenticated and no query params, redirect to home
  if (!isAuth || !userData) {
    redirect('/');
  }
  
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <WorkoutSetupClient user={userData} />
    </main>
  );
} 