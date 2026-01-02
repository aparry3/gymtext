import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Admin layout that enforces authentication
 *
 * This layout wraps all /admin/* routes (except /admin/login which has its own layout)
 * and ensures users are authenticated before rendering any admin pages.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('gt_admin');

  // Check if user is authenticated as admin
  if (!adminCookie || adminCookie.value !== 'ok') {
    // Redirect to admin login
    redirect('/admin/login');
  }

  return <>{children}</>;
}
