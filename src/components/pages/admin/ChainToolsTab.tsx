'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChainRunButton } from './ChainRunButton'
import { parseDate, formatDate } from '@/shared/utils/date'

interface FitnessPlan {
  id: string
  description: string | null
  formatted: string | null
  message: string | null
  structured: unknown | null
  startDate: Date
  createdAt: Date
}

interface Microcycle {
  id: string
  absoluteWeek: number
  days: string[]
  description: string | null
  formatted: string | null
  message: string | null
  structured: unknown | null
  isDeload: boolean
  startDate: Date
  endDate: Date
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: string
  goal: string | null
  description: string | null
  message: string | null
  structured: unknown | null
  details: { formatted?: string } | null
}

interface ChainToolsTabProps {
  userId: string
}

export function ChainToolsTab({ userId }: ChainToolsTabProps) {
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null)
  const [microcycles, setMicrocycles] = useState<Microcycle[]>([])
  const [workouts, setWorkouts] = useState<WorkoutInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [planResponse, workoutsResponse] = await Promise.all([
        fetch(`/api/users/${userId}/fitness-plan`),
        fetch(`/api/users/${userId}/workouts?limit=10`)
      ])

      // Handle fitness plan response
      if (planResponse.ok) {
        const planResult = await planResponse.json()
        if (planResult.success && planResult.data) {
          const planData = planResult.data
          setFitnessPlan({
            ...planData,
            startDate: parseDate(planData.startDate),
            createdAt: parseDate(planData.createdAt),
          })

          // Fetch microcycles for this plan
          const microcyclesResponse = await fetch(`/api/users/${userId}/microcycles`)
          if (microcyclesResponse.ok) {
            const microcyclesResult = await microcyclesResponse.json()
            if (microcyclesResult.success && microcyclesResult.data) {
              setMicrocycles(
                microcyclesResult.data.map((m: Microcycle) => ({
                  ...m,
                  startDate: parseDate(m.startDate),
                  endDate: parseDate(m.endDate),
                }))
              )
            }
          }
        }
      }

      // Handle workouts response
      if (workoutsResponse.ok) {
        const workoutsResult = await workoutsResponse.json()
        if (workoutsResult.success && workoutsResult.data) {
          setWorkouts(
            workoutsResult.data.map((w: WorkoutInstance) => ({
              ...w,
              date: parseDate(w.date),
            }))
          )
        }
      }
    } catch (err) {
      console.error('Error fetching chain tools data:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSuccess = () => {
    // Refresh data after a successful chain run
    fetchData()
  }

  if (isLoading) {
    return <ChainToolsSkeleton />
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fitness Plan Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">
          Fitness Plan
        </h3>
        {fitnessPlan ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">ID: {fitnessPlan.id.slice(0, 8)}...</Badge>
              <Badge variant="outline">Started: {formatDate(fitnessPlan.startDate)}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label="Description" hasValue={!!fitnessPlan.description} />
              <StatusBadge label="Formatted" hasValue={!!fitnessPlan.formatted} />
              <StatusBadge label="Message" hasValue={!!fitnessPlan.message} />
              <StatusBadge label="Structured" hasValue={!!fitnessPlan.structured} />
            </div>
            <ChainRunButton
              entityType="fitness-plan"
              entityId={fitnessPlan.id}
              onSuccess={handleSuccess}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No fitness plan found</p>
        )}
      </Card>

      {/* Microcycles Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">
          Microcycles ({microcycles.length})
        </h3>
        {microcycles.length > 0 ? (
          <div className="space-y-4">
            {microcycles.map((microcycle) => (
              <div
                key={microcycle.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Week {microcycle.absoluteWeek}</Badge>
                  {microcycle.isDeload && <Badge variant="secondary">Deload</Badge>}
                  <Badge variant="outline" className="text-xs">
                    {formatDate(microcycle.startDate)} - {formatDate(microcycle.endDate)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label="Days" hasValue={microcycle.days?.length === 7} />
                  <StatusBadge label="Description" hasValue={!!microcycle.description} />
                  <StatusBadge label="Formatted" hasValue={!!microcycle.formatted} />
                  <StatusBadge label="Message" hasValue={!!microcycle.message} />
                  <StatusBadge label="Structured" hasValue={!!microcycle.structured} />
                </div>
                <ChainRunButton
                  entityType="microcycle"
                  entityId={microcycle.id}
                  onSuccess={handleSuccess}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No microcycles found</p>
        )}
      </Card>

      {/* Workouts Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">
          Recent Workouts ({workouts.length})
        </h3>
        {workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{formatDate(workout.date)}</Badge>
                  <Badge variant="secondary">{workout.sessionType}</Badge>
                  {workout.goal && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {workout.goal}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label="Description" hasValue={!!workout.description} />
                  <StatusBadge label="Formatted" hasValue={!!workout.details?.formatted} />
                  <StatusBadge label="Message" hasValue={!!workout.message} />
                  <StatusBadge label="Structured" hasValue={!!workout.structured} />
                </div>
                <ChainRunButton
                  entityType="workout"
                  entityId={workout.id}
                  onSuccess={handleSuccess}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No workouts found</p>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ label, hasValue }: { label: string; hasValue: boolean }) {
  return (
    <Badge
      variant={hasValue ? 'default' : 'outline'}
      className={`text-xs ${hasValue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
    >
      {label}: {hasValue ? '✓' : '✗'}
    </Badge>
  )
}

function ChainToolsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </Card>
      <Card className="p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-24 w-full" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-5 w-44 mb-4" />
        <Skeleton className="h-24 w-full" />
      </Card>
    </div>
  )
}
