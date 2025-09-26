'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageView } from '@/hooks/useAnalytics'

interface FitnessPlan {
  id: string
  programType: 'endurance' | 'strength' | 'shred' | 'hybrid' | 'rehab' | 'other'
  lengthWeeks: number
  mesocycles: Array<{
    name: string
    weeks: number
    focus: string[]
    deload: boolean
  }>
  overview: string
  notes?: string
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

  useEffect(() => {
    const fetchProgramData = async () => {
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
    }

    fetchProgramData()
  }, [userId])

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
        <RecentWorkoutsTable workouts={recentWorkouts} userId={userId} />
      </div>
    </div>
  )
}

interface ProgramSummaryCardProps {
  fitnessPlan: FitnessPlan
}

function ProgramSummaryCard({ fitnessPlan }: ProgramSummaryCardProps) {
  const programTypeLabels = {
    endurance: 'Endurance',
    strength: 'Strength',
    shred: 'Shred',
    hybrid: 'Hybrid',
    rehab: 'Rehab',
    other: 'Other'
  }

  const currentMesocycle = fitnessPlan.mesocycles[fitnessPlan.currentMesocycleIndex]
  
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Program Overview</h2>
          <div className="flex items-center gap-2">
            <Badge variant="default">
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
            Mesocycle {fitnessPlan.currentMesocycleIndex + 1} • Week {fitnessPlan.currentMicrocycleWeek}
          </div>
          {currentMesocycle && (
            <div className="text-sm text-muted-foreground">
              {currentMesocycle.name}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4">{fitnessPlan.overview}</p>
      
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
  
  const handleClick = () => {
    router.push(`/admin/users/${userId}/program/mesocycles/${index}`)
  }

  return (
    <Card 
      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${isCurrent ? 'ring-2 ring-primary' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium">{mesocycle.name}</h4>
          <p className="text-sm text-muted-foreground">Mesocycle {index + 1}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-xs">
            {mesocycle.weeks} weeks
          </Badge>
          {mesocycle.deload && (
            <Badge variant="secondary" className="text-xs">
              Deload
            </Badge>
          )}
          {isCurrent && (
            <Badge variant="default" className="text-xs">
              Current
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {mesocycle.focus.map((focus, focusIndex) => (
            <Badge key={focusIndex} variant="outline" className="text-xs">
              {focus}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}

interface RecentWorkoutsTableProps {
  workouts: WorkoutInstance[]
  userId: string
}

function RecentWorkoutsTable({ workouts, userId }: RecentWorkoutsTableProps) {
  const router = useRouter()
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
            </tr>
          </thead>
          <tbody className="divide-y">
            {workouts.map((workout) => (
              <tr 
                key={workout.id} 
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => router.push(`/admin/users/${userId}/program/workouts/${workout.id}`)}
              >
                <td className="px-4 py-3 text-sm">
                  {new Date(workout.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline">
                    {sessionTypeLabels[workout.sessionType]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {workout.mesocycleIndex !== undefined && workout.microcycleWeek !== undefined 
                    ? `M${workout.mesocycleIndex + 1} W${workout.microcycleWeek}`
                    : '-'
                  }
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={workout.completedAt ? "default" : "secondary"}>
                    {workout.completedAt ? 'Completed' : 'Planned'}
                  </Badge>
                </td>
              </tr>
            ))}
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