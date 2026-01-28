import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getProgramsContext } from '@/lib/context';
import { ProgramsSidebar } from '@/components/layout/ProgramsSidebar';
import { OwnerProvider } from '@/context/OwnerContext';

/**
 * Protected layout that enforces program owner authentication
 *
 * This layout wraps all protected routes and ensures users are authenticated
 * as program owners before rendering any pages.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const ownerCookie = cookieStore.get('gt_programs_owner');

  // Check if user has owner cookie
  if (!ownerCookie || !ownerCookie.value) {
    redirect('/login');
  }

  // Verify the owner exists and is active
  const { services } = await getProgramsContext();
  const owner = await services.programOwner.getById(ownerCookie.value);

  if (!owner || !owner.isActive) {
    // Invalid or inactive owner - redirect to login
    redirect('/login');
  }

  return (
    <OwnerProvider owner={owner}>
      <div className="min-h-screen bg-gray-50/50">
        <ProgramsSidebar owner={owner} />
        <main className="md:pl-64 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </OwnerProvider>
  );
}
