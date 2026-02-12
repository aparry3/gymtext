import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * Admin layout that enforces authentication and provides navigation sidebar
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
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="pt-16 md:pt-0 md:pl-[var(--admin-sidebar-width,16rem)] transition-[padding] duration-200">
        {children}
      </main>
    </div>
  );
}
