'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageView } from '@/hooks/useAnalytics'

interface Mesocycle {
  name: string
  objective: string
  focus: string[]
  durationWeeks: number
  startWeek: number
  endWeek: number
  volumeTrend: 'increasing' | 'stable' | 'decreasing'
  intensityTrend: 'increasing' | 'stable' | 'taper'
  conditioningFocus?: string | null
  weeklyVolumeTargets?: Record<string, number> | null
  avgRIRRange?: [number, number] | null
  keyThemes?: string[] | null
  longFormDescription: string
  microcycles: string[]
}

interface FitnessPlan {
  id: string
  programType: 'endurance' | 'strength' | 'shred' | 'hybrid' | 'rehab' | 'other'
  lengthWeeks: number
  mesocycles: Mesocycle[]
  overview: string
  planDescription?: string | null
  reasoning?: string | null
  notes?: string | null
  goalStatement?: string | null
  startDate?: Date
  currentMesocycleIndex: number
  currentMicrocycleWeek: number
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: 'run' | 'lift' | 'metcon' | 'mobility' | 'rest' | 'other'
  completedAt: Date | null
  mesocycleIndex?: number
  microcycleWeek?: number
}

interface ProgramTabProps {
  userId: string
}

export function ProgramTab({ userId }: ProgramTabProps) {
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Analytics tracking
  usePageView('program_viewed', { userId, fitnessPlanId: fitnessPlan?.id })

  const fetchProgramData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [planResponse, workoutsResponse] = await Promise.all([
        fetch(`/api/admin/users/${userId}/fitness-plan`),
        fetch(`/api/admin/users/${userId}/workouts?limit=5`)
      ])

      if (!planResponse.ok && planResponse.status !== 404) {
        throw new Error('Failed to fetch fitness plan')
      }

      if (!workoutsResponse.ok) {
        throw new Error('Failed to fetch workouts')
      }

      const planResult = planResponse.ok ? await planResponse.json() : { success: false }
      const workoutsResult = await workoutsResponse.json()

      if (planResult.success) {
        setFitnessPlan(planResult.data)
      }

      if (workoutsResult.success) {
        setRecentWorkouts(workoutsResult.data)
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

  if (!fitnessPlan) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Dumbbell className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Program Found</h3>
        <p className="text-muted-foreground">
          This user doesn&apos;t have an active fitness program yet.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Program Summary Card */}
      <ProgramSummaryCard fitnessPlan={fitnessPlan} />

      {/* Mesocycle List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mesocycles</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fitnessPlan.mesocycles.map((mesocycle, index) => (
            <MesocycleCard 
              key={index} 
              mesocycle={mesocycle} 
              index={index}
              isCurrent={index === fitnessPlan.currentMesocycleIndex}
              userId={userId}
            />
          ))}
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Workouts</h3>
        <RecentWorkoutsTable workouts={recentWorkouts} userId={userId} onWorkoutDeleted={fetchProgramData} />
      </div>
    </div>
  )
}

interface ProgramSummaryCardProps {
  fitnessPlan: FitnessPlan
}

function ProgramSummaryCard({ fitnessPlan }: ProgramSummaryCardProps) {
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [expandedReasoning, setExpandedReasoning] = useState(false)

  const programTypeLabels = {
    endurance: 'Endurance',
    strength: 'Strength',
    shred: 'Shred',
    hybrid: 'Hybrid',
    rehab: 'Rehab',
    other: 'Other'
  }

  const currentMesocycle = fitnessPlan.mesocycles[fitnessPlan.currentMesocycleIndex]

  // Calculate progress percentage
  const totalWeeks = fitnessPlan.lengthWeeks
  let completedWeeks = 0
  for (let i = 0; i < fitnessPlan.currentMesocycleIndex; i++) {
    const meso = fitnessPlan.mesocycles[i]
    completedWeeks += meso.durationWeeks
  }
  completedWeeks += fitnessPlan.currentMicrocycleWeek
  const progressPercentage = Math.round((completedWeeks / totalWeeks) * 100)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Program Overview</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="text-sm">
              {programTypeLabels[fitnessPlan.programType]}
            </Badge>
            <Badge variant="outline">
              {fitnessPlan.lengthWeeks} weeks
            </Badge>
            {fitnessPlan.startDate && (
              <Badge variant="outline">
                Started {new Date(fitnessPlan.startDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current Progress</div>
          <div className="font-medium">
            Mesocycle {fitnessPlan.currentMesocycleIndex + 1} • Week {fitnessPlan.currentMicrocycleWeek + 1}
          </div>
          {currentMesocycle && (
            <div className="text-sm text-muted-foreground">
              {currentMesocycle.name}
            </div>
          )}
          <div className="mt-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{progressPercentage}% complete</div>
          </div>
        </div>
      </div>

      {fitnessPlan.goalStatement && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900">Goal Statement</div>
          <p className="text-sm text-blue-800 mt-1">{fitnessPlan.goalStatement}</p>
        </div>
      )}

      <p className="text-muted-foreground mb-4">{fitnessPlan.overview}</p>

      {fitnessPlan.planDescription && (
        <div className="border-t pt-4 mb-4">
          <button
            onClick={() => setExpandedDescription(!expandedDescription)}
            className="flex items-center justify-between w-full text-left mb-2 hover:opacity-70"
          >
            <h4 className="font-medium">Plan Description</h4>
            <span className="text-sm text-muted-foreground">
              {expandedDescription ? '▼' : '▶'}
            </span>
          </button>
          {expandedDescription && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{fitnessPlan.planDescription}</p>
          )}
        </div>
      )}

      {fitnessPlan.reasoning && (
        <div className="border-t pt-4 mb-4">
          <button
            onClick={() => setExpandedReasoning(!expandedReasoning)}
            className="flex items-center justify-between w-full text-left mb-2 hover:opacity-70"
          >
            <h4 className="font-medium">Programming Reasoning</h4>
            <span className="text-sm text-muted-foreground">
              {expandedReasoning ? '▼' : '▶'}
            </span>
          </button>
          {expandedReasoning && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{fitnessPlan.reasoning}</p>
          )}
        </div>
      )}

      {fitnessPlan.notes && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-sm text-muted-foreground">{fitnessPlan.notes}</p>
        </div>
      )}
    </Card>
  )
}

interface MesocycleCardProps {
  mesocycle: FitnessPlan['mesocycles'][0]
  index: number
  isCurrent: boolean
  userId: string
}

function MesocycleCard({ mesocycle, index, isCurrent, userId }: MesocycleCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const handleClick = () => {
    router.push(`/admin/users/${userId}/program/mesocycles/${index}`)
  }

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing' | 'taper') => {
    switch (trend) {
      case 'increasing': return '↑'
      case 'decreasing': return '↓'
      case 'taper': return '↘'
      case 'stable': return '→'
    }
  }

  return (
    <Card
      className={`p-4 transition-shadow ${
        isCurrent ? 'border-2 border-primary shadow-lg bg-primary/5' : ''
      }`}
    >
      <div className="cursor-pointer" onClick={handleClick}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>{mesocycle.name}</h4>
            <p className="text-sm text-muted-foreground">Mesocycle {index + 1}</p>
            {mesocycle.objective && (
              <p className="text-xs text-muted-foreground mt-1">{mesocycle.objective}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              {mesocycle.durationWeeks} weeks
            </Badge>
            {isCurrent && (
              <Badge variant="default" className="text-xs">
                Current
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">Vol:</span> {getTrendIcon(mesocycle.volumeTrend)}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">Int:</span> {getTrendIcon(mesocycle.intensityTrend)}
            </span>
            {mesocycle.avgRIRRange && (
              <span className="text-muted-foreground">
                <span className="font-medium">RIR:</span> {mesocycle.avgRIRRange[0]}-{mesocycle.avgRIRRange[1]}
              </span>
            )}
          </div>

          {mesocycle.weeklyVolumeTargets && Object.keys(mesocycle.weeklyVolumeTargets).length > 0 && (
            <div className="text-xs space-y-1">
              <div className="font-medium text-muted-foreground">Volume Targets:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(mesocycle.weeklyVolumeTargets).slice(0, 3).map(([muscle, sets]) => (
                  <Badge key={muscle} variant="outline" className="text-xs">
                    {muscle}: {sets}
                  </Badge>
                ))}
                {Object.keys(mesocycle.weeklyVolumeTargets).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{Object.keys(mesocycle.weeklyVolumeTargets).length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {mesocycle.focus.map((focus, focusIndex) => (
            <Badge key={focusIndex} variant="outline" className="text-xs">
              {focus}
            </Badge>
          ))}
        </div>

        {mesocycle.keyThemes && mesocycle.keyThemes.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {mesocycle.keyThemes.slice(0, 2).map((theme, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {mesocycle.longFormDescription && (
        <div className="mt-3 pt-3 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="flex items-center justify-between w-full text-left hover:opacity-70"
          >
            <span className="text-xs font-medium">Description</span>
            <span className="text-xs text-muted-foreground">{expanded ? '▼' : '▶'}</span>
          </button>
          {expanded && (
            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{mesocycle.longFormDescription}</p>
          )}
        </div>
      )}
    </Card>
  )
}

interface RecentWorkoutsTableProps {
  workouts: WorkoutInstance[]
  userId: string
  onWorkoutDeleted: () => void
}

function RecentWorkoutsTable({ workouts, userId, onWorkoutDeleted }: RecentWorkoutsTableProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (workouts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No recent workouts found</p>
      </Card>
    )
  }

  const sessionTypeLabels = {
    run: 'Run',
    lift: 'Lift',
    metcon: 'MetCon',
    mobility: 'Mobility',
    rest: 'Rest',
    other: 'Other'
  }

  // Helper to check if workout date is today
  const isToday = (date: Date) => {
    const today = new Date()
    const workoutDate = new Date(date)
    return (
      workoutDate.getDate() === today.getDate() &&
      workoutDate.getMonth() === today.getMonth() &&
      workoutDate.getFullYear() === today.getFullYear()
    )
  }

  const handleDelete = async (e: React.MouseEvent, workoutId: string) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return
    }

    setDeletingId(workoutId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/workouts/${workoutId}`, {
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
              <th className="px-4 py-3 text-left text-sm font-medium">Week</th>
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
                    onClick={() => router.push(`/admin/users/${userId}/program/workouts/${workout.id}`)}
                  >
                    {new Date(workout.date).toLocaleDateString()}
                    {isTodayWorkout && <span className="ml-2 text-xs text-primary">(Today)</span>}
                  </td>
                  <td
                    className="px-4 py-3 text-sm cursor-pointer"
                    onClick={() => router.push(`/admin/users/${userId}/program/workouts/${workout.id}`)}
                  >
                    <Badge variant={isTodayWorkout ? "default" : "outline"}>
                      {sessionTypeLabels[workout.sessionType] || workout.sessionType}
                    </Badge>
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-muted-foreground cursor-pointer"
                    onClick={() => router.push(`/admin/users/${userId}/program/workouts/${workout.id}`)}
                  >
                    {workout.mesocycleIndex !== undefined && workout.microcycleWeek !== undefined
                      ? `M${workout.mesocycleIndex} W${workout.microcycleWeek}`
                      : '-'
                    }
                  </td>
                  <td
                    className="px-4 py-3 text-sm cursor-pointer"
                    onClick={() => router.push(`/admin/users/${userId}/program/workouts/${workout.id}`)}
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
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>

      {/* Mesocycles Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>

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

const Dumbbell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
)