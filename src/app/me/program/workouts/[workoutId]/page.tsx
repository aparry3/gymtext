import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decryptUserId } from '@/server/utils/sessionCrypto'
import { WorkoutDetailView } from '@/components/pages/shared/WorkoutDetailView'

export default async function ClientWorkoutDetailPage({
  params
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params

  // Get userId from session cookie
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('gt_user_session')

  if (!sessionCookie) {
    redirect('/me/login')
  }

  const userId = decryptUserId(sessionCookie.value)

  if (!userId) {
    redirect('/me/login')
  }

  return (
    <WorkoutDetailView
      userId={userId}
      workoutId={workoutId}
      basePath="/me"
      showAdminActions={false}
    />
  )
}
