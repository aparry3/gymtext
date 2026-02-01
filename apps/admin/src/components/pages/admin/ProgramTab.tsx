'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { parseDate, formatDate } from '@/shared/utils/date'
import { StructuredPlanRenderer } from '@/components/pages/shared/StructuredPlanRenderer'
import type { PlanStructure } from '@/server/models/fitnessPlan'
import { getStepName, getProgressPercentage, TOTAL_STEPS } from '@/shared/constants/onboarding'

interface FitnessPlan {
  id: string
  description: string | null
  structured: PlanStructure | null
  message: string | null
  startDate: Date
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: string
  completedAt: Date | null
  goal: string | null
}

interface Microcycle {
  id: string
  absoluteWeek: number
  description: string | null
  isDeload: boolean
  isActive: boolean
  startDate: Date
  endDate: Date
}

interface ProgramTabProps {
  userId: string
  basePath?: string
  showAdminActions?: boolean
  onboardingStatus?: 'pending' | 'in_progress' | 'completed' | 'failed' | null
  currentStep?: number | null
}

export function ProgramTab({
  userId,
  basePath = '/users',
  showAdminActions = true,
  onboardingStatus = null,
  currentStep = null
}: ProgramTabProps) {
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutInstance[]>([])
  const [recentMicrocycles, setRecentMicrocycles] = useState<Microcycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgramData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [planResponse, workoutsResponse, microcyclesResponse] = await Promise.all([
        fetch(`/api/users/${userId}/fitness-plan`),
        fetch(`/api/users/${userId}/workouts?limit=5`),
        fetch(`/api/users/${userId}/microcycles?limit=5`)
      ])

      // Handle fitness plan response - 404 is expected during onboarding
      if (planResponse.ok) {
        const planResult = await planResponse.json()
        if (planResult.success) {
          setFitnessPlan(planResult.data)
        }
      } else if (planResponse.status !== 404) {
        throw new Error('Failed to fetch fitness plan')
      }

      // Handle workouts response - empty results are expected during onboarding
      if (workoutsResponse.ok) {
        const workoutsResult = await workoutsResponse.json()
        if (workoutsResult.success) {
          // Parse date strings to Date objects when loading
          const workouts = workoutsResult.data.map((w: WorkoutInstance) => ({
            ...w,
            date: parseDate(w.date),
            completedAt: w.completedAt ? new Date(w.completedAt) : null
          }))
          setRecentWorkouts(workouts)
        }
      } else if (workoutsResponse.status !== 404) {
        throw new Error('Failed to fetch workouts')
      }

      // Handle microcycles response - empty results are expected during onboarding
      if (microcyclesResponse.ok) {
        const microcyclesResult = await microcyclesResponse.json()
        if (microcyclesResult.success) {
          // Parse date strings to Date objects when loading
          const microcycles = microcyclesResult.data.map((m: Microcycle) => ({
            ...m,
            startDate: parseDate(m.startDate),
            endDate: parseDate(m.endDate)
          }))
          setRecentMicrocycles(microcycles)
        }
      } else if (microcyclesResponse.status !== 404) {
        throw new Error('Failed to fetch microcycles')
      }
    } catch (err) {
      setError('Failed to load program data')
      console.error('Error fetching program data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProgramData()
  }, [fetchProgramData])

  // Re-fetch when onboarding status changes (to pick up new data as it's created)
  useEffect(() => {
    if (onboardingStatus === 'in_progress' || onboardingStatus === 'completed') {
      fetchProgramData()
    }
  }, [onboardingStatus, fetchProgramData])

  if (isLoading) {
    return <ProgramTabSkeleton />
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg text-muted-foreground mb-2">Error Loading Program</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    )
  }

  // If no fitness plan yet, check if onboarding is in progress
  if (!fitnessPlan) {
    if (onboardingStatus === 'in_progress' || onboardingStatus === 'pending') {
      return <OnboardingInProgressCard currentStep={currentStep} />
    }

    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Dumbbell className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Program Found</h3>
        <p className="text-muted-foreground">
          You don&apos;t have an active fitness program yet.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Program Summary Card */}
      <ProgramSummaryCard fitnessPlan={fitnessPlan} />

      {/* Recent Workouts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Workouts</h3>
        {recentWorkouts.length === 0 && (onboardingStatus === 'in_progress' || onboardingStatus === 'pending') ? (
          <OnboardingWorkoutsLoadingCard currentStep={currentStep} />
        ) : (
          <RecentWorkoutsTable workouts={recentWorkouts} userId={userId} basePath={basePath} showAdminActions={showAdminActions} onWorkoutDeleted={fetchProgramData} />
        )}
        {recentWorkouts.length > 0 && (
          <div className="text-center">
            <Link
              href={basePath === '/me' ? '/me/workouts' : `${basePath}/${userId}/workouts`}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              View all workouts →
            </Link>
          </div>
        )}
      </div>

      {/* Recent Microcycles - Admin only */}
      {showAdminActions && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Microcycles</h3>
          <RecentMicrocyclesTable microcycles={recentMicrocycles} userId={userId} basePath={basePath} />
          {recentMicrocycles.length > 0 && (
            <div className="text-center">
              <Link
                href={`${basePath}/${userId}/microcycles`}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                View all microcycles →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ProgramSummaryCardProps {
  fitnessPlan: FitnessPlan
}

function ProgramSummaryCard({ fitnessPlan }: ProgramSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Program Overview</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {fitnessPlan.startDate && (
              <Badge variant="outline">
                Started {new Date(fitnessPlan.startDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {fitnessPlan.structured ? (
        <StructuredPlanRenderer structure={fitnessPlan.structured} showHeader={false} />
      ) : (
        <p className="text-muted-foreground">No structured plan data available</p>
      )}
    </Card>
  )
}

interface RecentWorkoutsTableProps {
  workouts: WorkoutInstance[]
  userId: string
  basePath: string
  showAdminActions: boolean
  onWorkoutDeleted: () => void
}

function RecentWorkoutsTable({ workouts, userId, basePath, showAdminActions, onWorkoutDeleted }: RecentWorkoutsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (workouts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No recent workouts found</p>
      </Card>
    )
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

  // Helper to check if workout date is today
  const isToday = (date: Date) => {
    // Compare UTC dates (workout dates are parsed as UTC)
    const today = new Date()
    return (
      date.getUTCFullYear() === today.getUTCFullYear() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCDate() === today.getUTCDate()
    )
  }

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
        onWorkoutDeleted()
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

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Session Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Goal</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              {showAdminActions && (
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              )}
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
                    onClick={() => {
                      const path = basePath === '/me'
                        ? `/me/program/workouts/${workout.id}`
                        : `${basePath}/${userId}/program/workouts/${workout.id}`
                      router.push(path)
                    }}
                  >
                    {formatDate(workout.date)}
                    {isTodayWorkout && <span className="ml-2 text-xs text-primary">(Today)</span>}
                  </td>
                  <td
                    className="px-4 py-3 text-sm cursor-pointer"
                    onClick={() => {
                      const path = basePath === '/me'
                        ? `/me/program/workouts/${workout.id}`
                        : `${basePath}/${userId}/program/workouts/${workout.id}`
                      router.push(path)
                    }}
                  >
                    <Badge variant={isTodayWorkout ? "default" : "outline"}>
                      {sessionTypeLabels[workout.sessionType] || workout.sessionType}
                    </Badge>
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-muted-foreground cursor-pointer max-w-48 truncate"
                    onClick={() => {
                      const path = basePath === '/me'
                        ? `/me/program/workouts/${workout.id}`
                        : `${basePath}/${userId}/program/workouts/${workout.id}`
                      router.push(path)
                    }}
                  >
                    {workout.goal || '-'}
                  </td>
                  <td
                    className="px-4 py-3 text-sm cursor-pointer"
                    onClick={() => {
                      const path = basePath === '/me'
                        ? `/me/program/workouts/${workout.id}`
                        : `${basePath}/${userId}/program/workouts/${workout.id}`
                      router.push(path)
                    }}
                  >
                    <Badge variant={workout.completedAt ? "default" : "secondary"}>
                      {workout.completedAt ? 'Completed' : 'Planned'}
                    </Badge>
                  </td>
                  {showAdminActions && (
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
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

interface RecentMicrocyclesTableProps {
  microcycles: Microcycle[]
  userId: string
  basePath: string
}

function RecentMicrocyclesTable({ microcycles, userId, basePath }: RecentMicrocyclesTableProps) {
  const router = useRouter()

  if (microcycles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No microcycles found</p>
      </Card>
    )
  }

  // Helper to check if microcycle is current week
  const isCurrentWeek = (startDate: Date, endDate: Date) => {
    const now = new Date()
    return now >= startDate && now <= endDate
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Week</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date Range</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {microcycles.map((microcycle) => {
              const isCurrent = isCurrentWeek(microcycle.startDate, microcycle.endDate)
              return (
                <tr
                  key={microcycle.id}
                  onClick={() => router.push(`${basePath}/${userId}/microcycles/${microcycle.id}`)}
                  className={`hover:bg-muted/30 cursor-pointer ${isCurrent ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
                >
                  <td className={`px-4 py-3 text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                    Week {microcycle.absoluteWeek}
                    {isCurrent && <span className="ml-2 text-xs text-primary">(Current)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(microcycle.startDate)} - {formatDate(microcycle.endDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-48 truncate">
                    {microcycle.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {microcycle.isDeload && (
                        <Badge variant="secondary">Deload</Badge>
                      )}
                      {microcycle.isActive && (
                        <Badge variant={isCurrent ? "default" : "outline"}>Active</Badge>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ProgramTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Program Summary Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>

      {/* Recent Workouts Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Card className="p-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function OnboardingInProgressCard({ currentStep }: { currentStep: number | null }) {
  const stepName = currentStep ? getStepName(currentStep) : 'Getting started...'
  const progress = currentStep ? getProgressPercentage(currentStep) : 0

  return (
    <Card className="p-12 text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Dumbbell className="h-6 w-6 text-primary animate-pulse" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Building Your Program</h3>
      <p className="text-muted-foreground mb-6">
        We&apos;re creating your personalized fitness plan. This usually takes 30-60 seconds.
      </p>

      {/* Progress bar */}
      <div className="mt-6 h-2 w-full bg-gray-200 rounded-full overflow-hidden max-w-md mx-auto">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Step indicator */}
      <div className="mt-4 space-y-1">
        <p className="text-sm font-medium text-primary">
          {currentStep ? `Step ${currentStep} of ${TOTAL_STEPS}` : 'Starting...'}
        </p>
        <p className="text-sm text-muted-foreground">
          {stepName}
        </p>
      </div>
    </Card>
  )
}

function OnboardingWorkoutsLoadingCard({ currentStep }: { currentStep: number | null }) {
  const stepName = currentStep ? getStepName(currentStep) : 'Getting started...'

  return (
    <Card className="p-8 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <div>
          <p className="text-sm font-medium">Creating your workouts...</p>
          <p className="text-xs text-muted-foreground">{stepName}</p>
        </div>
      </div>
    </Card>
  )
}

const Dumbbell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
)
