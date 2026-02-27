import { redirect } from 'next/navigation'

export default async function ClientWorkoutDetailPage({
  params
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params

  // Redirect old workout URLs to the new workout detail page
  redirect(`/me/workouts/${workoutId}`)
}
