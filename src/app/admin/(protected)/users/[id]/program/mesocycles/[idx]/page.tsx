'use client'

import { useParams } from 'next/navigation'
import { MesocycleDetailView } from '@/components/pages/shared/MesocycleDetailView'

export default function MesocycleDetailPage() {
  const { id, idx } = useParams()
  const mesocycleIndex = parseInt(idx as string, 10)

  return (
    <MesocycleDetailView
      userId={id as string}
      mesocycleIndex={mesocycleIndex}
      basePath="/admin/users"
    />
  )
}
