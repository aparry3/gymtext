import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decryptUserId } from '@/server/utils/sessionCrypto';
import { MeSidebar } from '@/components/pages/me/layout/MeSidebar';
import { getServices } from '@/lib/context';

interface MeLayoutProps {
  children: React.ReactNode;
}

export default async function MeLayout({ children }: MeLayoutProps) {
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

  // Fetch user data for sidebar
  let userName = 'User';
  let programType: string | undefined;

  try {
    const services = getServices();
    const result = await services.user.getUserForAdmin(userId);
    if (result?.user) {
      userName = result.user.name || 'User';
      // Try to extract program type from fitness profile or plan
      // For now, use a placeholder - this will be enhanced when we have structured plan data
      programType = 'Strength + Lean Build';
    }
  } catch (error) {
    console.error('Error fetching user for sidebar:', error);
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <MeSidebar
        user={{
          name: userName,
          programType,
        }}
      />

      {/* Main content area */}
      <div className="md:pl-64">
        {/* Mobile header spacing */}
        <div className="h-16 md:h-0" />

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
