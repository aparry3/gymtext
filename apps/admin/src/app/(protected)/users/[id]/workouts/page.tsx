'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { parseDate, formatDate } from '@/shared/utils/date'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: string
  completedAt: Date | null
  goal: string | null
}

export default function AllWorkoutsPage() {
  const { id: userId } = useParams()
  const router = useRouter()
  const { mode } = useEnvironment()
  const [workouts, setWorkouts] = useState<WorkoutInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/workouts?limit=1000`)

      if (!response.ok) {
        throw new Error('Failed to fetch workouts')
      }

      const result = await response.json()
      if (result.success) {
        const parsedWorkouts = result.data.map((w: WorkoutInstance) => ({
          ...w,
          date: parseDate(w.date),
          completedAt: w.completedAt ? new Date(w.completedAt) : null
        }))
        setWorkouts(parsedWorkouts)
      }
    } catch (err) {
      setError('Failed to load workouts')
      console.error('Error fetching workouts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchWorkouts()
    }
  }, [userId, fetchWorkouts, mode])

  const handleDelete = async (e: React.MouseEvent, workoutId: string) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return
    }

    setDeletingId(workoutId)
    try {
      const response = await fetch(`/api/users/${userId}/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchWorkouts()
      } else {
        alert(result.message || 'Failed to delete workout')
      }
    } catch (err) {
      console.error('Error deleting workout:', err)
      alert('Failed to delete workout')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRowClick = (workoutId: string) => {
    router.push(`/users/${userId}/program/workouts/${workoutId}`)
  }

  const sessionTypeLabels: Record<string, string> = {
    run: 'Run',
    lift: 'Lift',
    metcon: 'MetCon',
    mobility: 'Mobility',
    rest: 'Rest',
    strength: 'Strength',
    cardio: 'Cardio',
    recovery: 'Recovery',
    assessment: 'Assessment',
    deload: 'Deload',
    workout: 'Workout',
    other: 'Other'
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getUTCFullYear() === today.getUTCFullYear() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCDate() === today.getUTCDate()
    )
  }

  if (isLoading) {
    return <AllWorkoutsSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-2">Error Loading Workouts</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/users/${userId}`}>User Details</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Workouts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">All Workouts</h1>
            <Badge variant="outline">{workouts.length} total</Badge>
          </div>

          {/* Workouts Table */}
          {workouts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No workouts found for this user</p>
              <Link
                href={`/users/${userId}`}
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                ← Back to user profile
              </Link>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Session Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Goal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workouts.map((workout) => {
                      const isTodayWorkout = isToday(workout.date)
                      return (
                        <tr
                          key={workout.id}
                          className={`hover:bg-muted/30 ${isTodayWorkout ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
                        >
                          <td
                            className={`px-4 py-3 text-sm cursor-pointer ${isTodayWorkout ? 'font-semibold' : ''}`}
                            onClick={() => handleRowClick(workout.id)}
                          >
                            {formatDate(workout.date)}
                            {isTodayWorkout && <span className="ml-2 text-xs text-primary">(Today)</span>}
                          </td>
                          <td
                            className="px-4 py-3 text-sm cursor-pointer"
                            onClick={() => handleRowClick(workout.id)}
                          >
                            <Badge variant={isTodayWorkout ? "default" : "outline"}>
                              {sessionTypeLabels[workout.sessionType] || workout.sessionType}
                            </Badge>
                          </td>
                          <td
                            className="px-4 py-3 text-sm text-muted-foreground cursor-pointer max-w-48 truncate"
                            onClick={() => handleRowClick(workout.id)}
                          >
                            {workout.goal || '-'}
                          </td>
                          <td
                            className="px-4 py-3 text-sm cursor-pointer"
                            onClick={() => handleRowClick(workout.id)}
                          >
                            <Badge variant={workout.completedAt ? "default" : "secondary"}>
                              {workout.completedAt ? 'Completed' : 'Planned'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(e, workout.id)}
                              disabled={deletingId === workout.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deletingId === workout.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Back link */}
          <div className="text-center">
            <Link
              href={`/users/${userId}`}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              ← Back to user profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AllWorkoutsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-64" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Card className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
