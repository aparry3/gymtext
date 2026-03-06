import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decryptUserId } from '@/server/utils/sessionCrypto';
import { MeSidebar } from '@/components/pages/me/layout/MeSidebar';
import { MeContentWrapper } from '@/components/pages/me/layout/MeContentWrapper';
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

  // Check for impersonation
  const impersonationCookie = cookieStore.get('gt_impersonation');
  const isAdminView = !!impersonationCookie;
  const adminBackUrl = impersonationCookie?.value;

  // Fetch user data for sidebar
  let userName = 'User';
  let programType: string | undefined;

  try {
    const services = getServices();
    const result = await services.user.getUserForAdmin(userId);
    if (!result?.user) {
      redirect('/api/auth/logout?redirect=/start');
    }
    userName = result.user.name || 'User';
    programType = 'Strength + Lean Build';
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error; // Re-throw Next.js internal errors (redirect, notFound, etc.)
    }
    redirect('/api/auth/logout?redirect=/start');
  }

  return (
    <div className="me-dark min-h-screen bg-[hsl(var(--background))]">
      <MeSidebar
        user={{
          name: userName,
          programType,
        }}
        isAdminView={isAdminView}
        adminBackUrl={adminBackUrl}
      />

      {/* Main content area */}
      <MeContentWrapper>{children}</MeContentWrapper>
    </div>
  );
}
