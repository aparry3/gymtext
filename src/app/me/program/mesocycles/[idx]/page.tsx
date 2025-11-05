import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decryptUserId } from '@/server/utils/sessionCrypto'
import { MesocycleDetailView } from '@/components/pages/shared/MesocycleDetailView'

export default async function ClientMesocycleDetailPage({ params }: { params: Promise<{ idx: string }> }) {
  const { idx } = await params
  const mesocycleIndex = parseInt(idx, 10)

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
    <MesocycleDetailView
      userId={userId}
      mesocycleIndex={mesocycleIndex}
      basePath="/me"
    />
  )
}
