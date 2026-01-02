'use client'

import { useParams } from 'next/navigation'
import { WorkoutDetailView } from '@/components/pages/shared/WorkoutDetailView'

export default function WorkoutDetailPage() {
  const { id, workoutId } = useParams()

  return (
    <WorkoutDetailView
      userId={id as string}
      workoutId={workoutId as string}
      basePath="/admin/users"
      showAdminActions={true}
    />
  )
}
