'use client'

import { useParams } from 'next/navigation'
import { MicrocycleWeekView } from '@/components/pages/shared/MicrocycleWeekView'

export default function MicrocycleWeekPage() {
  const { id, idx, week } = useParams()
  const mesocycleIndex = parseInt(idx as string, 10)
  const weekNumber = parseInt(week as string, 10)

  return (
    <MicrocycleWeekView
      userId={id as string}
      mesocycleIndex={mesocycleIndex}
      weekNumber={weekNumber}
      basePath="/admin/users"
    />
  )
}
