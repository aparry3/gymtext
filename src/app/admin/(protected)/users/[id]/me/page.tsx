import { UserDashboard } from '@/components/pages/client/UserDashboard';

interface AdminUserMePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserMePage({ params }: AdminUserMePageProps) {
  const { id } = await params;

  return <UserDashboard userId={id} />;
}
