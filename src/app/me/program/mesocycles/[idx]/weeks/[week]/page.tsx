import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decryptUserId } from '@/server/utils/sessionCrypto'
import { MicrocycleWeekView } from '@/components/pages/shared/MicrocycleWeekView'

export default async function ClientMicrocycleWeekPage({
  params
}: {
  params: Promise<{ idx: string; week: string }>
}) {
  const { idx, week } = await params
  const mesocycleIndex = parseInt(idx, 10)
  const weekNumber = parseInt(week, 10)

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
    <MicrocycleWeekView
      userId={userId}
      mesocycleIndex={mesocycleIndex}
      weekNumber={weekNumber}
      basePath="/me"
    />
  )
}
