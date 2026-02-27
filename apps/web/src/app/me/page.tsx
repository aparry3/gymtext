import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decryptUserId } from '@/server/utils/sessionCrypto';
import { MeWorkoutPage } from '@/components/pages/me/MeWorkoutPage';

export default async function MePage() {
  // Get user ID from session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('gt_user_session');

  if (!sessionCookie) {
    redirect('/me/login');
  }

  const userId = decryptUserId(sessionCookie.value);

  if (!userId) {
    redirect('/me/login');
  }

  return <MeWorkoutPage userId={userId} />;
}
