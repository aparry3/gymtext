import { MeSidebar } from '@/components/pages/me/layout/MeSidebar';
import { userService } from '@/server/services';

interface AdminUserMeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function AdminUserMeLayout({ children, params }: AdminUserMeLayoutProps) {
  const { id } = await params;

  // Fetch user data for sidebar
  let userName = 'User';
  let programType: string | undefined;

  try {
    const result = await userService.getUserForAdmin(id);
    if (result?.user) {
      userName = result.user.name || 'User';
      programType = 'Strength + Lean Build';
    }
  } catch (error) {
    console.error('Error fetching user for sidebar:', error);
  }

  const basePath = `/users/${id}/me`;
  const adminBackUrl = `/users/${id}`;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <MeSidebar
        user={{
          name: userName,
          programType,
        }}
        basePath={basePath}
        isAdminView={true}
        adminBackUrl={adminBackUrl}
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
