import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decryptUserId } from '@/server/utils/sessionCrypto';
import { UserDashboard } from '@/components/pages/client/UserDashboard';

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ workout?: string }>;
}) {
  const { workout: initialWorkoutId } = await searchParams;

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

  return <UserDashboard userId={userId} initialWorkoutId={initialWorkoutId} />;
}
