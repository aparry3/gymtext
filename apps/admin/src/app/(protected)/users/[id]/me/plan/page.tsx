import { UserPlanView } from '@/components/pages/client/UserPlanView';

interface AdminUserPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserPlanPage({ params }: AdminUserPlanPageProps) {
  const { id } = await params;

  return <UserPlanView userId={id} />;
}
