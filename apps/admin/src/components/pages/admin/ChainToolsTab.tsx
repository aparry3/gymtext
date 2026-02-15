'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ChainRunButton, type EntityType } from './ChainRunButton'
import { parseDate, formatDate } from '@/shared/utils/date'

interface FitnessPlan {
  id: string
  description: string | null
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
  message: string | null
  structured: unknown | null
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [isRegeneratingProfile, setIsRegeneratingProfile] = useState(false)
  const [profileExecutionTime, setProfileExecutionTime] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [planResponse, workoutsResponse, userResponse] = await Promise.all([
        fetch(`/api/users/${userId}/fitness-plan`),
        fetch(`/api/users/${userId}/workouts?limit=10`),
        fetch(`/api/users/${userId}`)
      ])

      // Handle user response to check profile status
      if (userResponse.ok) {
        const userResult = await userResponse.json()
        if (userResult.success && userResult.data) {
          setHasProfile(!!userResult.data.profile)
        }
      }

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

  const handleRegenerateProfile = async () => {
    if (!window.confirm('Regenerate this user\'s profile from signup data? This will replace the current profile.')) {
      return
    }

    setIsRegeneratingProfile(true)
    setProfileExecutionTime(null)

    try {
      const response = await fetch(`/api/chains/profiles/${userId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to regenerate profile')
      }

      setProfileExecutionTime(result.executionTimeMs)
      setHasProfile(true)
      // Refresh data after successful regeneration
      fetchData()
    } catch (err) {
      console.error('Error regenerating profile:', err)
      alert(err instanceof Error ? err.message : 'Failed to regenerate profile')
    } finally {
      setIsRegeneratingProfile(false)
    }
  }

  const handleDelete = async (entityType: EntityType, entityId: string, entityName: string) => {
    const confirmMessage = entityType === 'microcycle'
      ? `Delete ${entityName}? This will also delete all workouts in this microcycle.`
      : `Delete ${entityName}?`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setDeletingId(entityId)

    try {
      const apiPath = getDeleteApiPath(entityType, entityId)
      const response = await fetch(apiPath, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete')
      }

      // Refresh data after successful deletion
      fetchData()
    } catch (err) {
      console.error('Error deleting:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
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
      {/* Profile Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">
          Profile
        </h3>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Profile" hasValue={hasProfile} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateProfile}
              disabled={isRegeneratingProfile}
            >
              <RefreshIcon className={`h-4 w-4 mr-2 ${isRegeneratingProfile ? 'animate-spin' : ''}`} />
              {isRegeneratingProfile ? 'Regenerating...' : 'Regenerate Profile'}
            </Button>
            {profileExecutionTime !== null && (
              <span className="text-xs text-muted-foreground">
                {(profileExecutionTime / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Regenerates profile from signup data (clean slate)
          </p>
        </div>
      </Card>

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
              <StatusBadge label="Message" hasValue={!!fitnessPlan.message} />
              <StatusBadge label="Structured" hasValue={!!fitnessPlan.structured} />
            </div>
            <div className="flex items-center gap-2">
              <ChainRunButton
                entityType="fitness-plan"
                entityId={fitnessPlan.id}
                onSuccess={handleSuccess}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete('fitness-plan', fitnessPlan.id, 'this fitness plan')}
                disabled={deletingId === fitnessPlan.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className={`h-4 w-4 ${deletingId === fitnessPlan.id ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
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
                  <Badge variant="outline" className="text-xs">
                    {formatDate(microcycle.startDate)} - {formatDate(microcycle.endDate)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label="Days" hasValue={microcycle.days?.length === 7} />
                  <StatusBadge label="Description" hasValue={!!microcycle.description} />
                  <StatusBadge label="Message" hasValue={!!microcycle.message} />
                  <StatusBadge label="Structured" hasValue={!!microcycle.structured} />
                </div>
                <div className="flex items-center gap-2">
                  <ChainRunButton
                    entityType="microcycle"
                    entityId={microcycle.id}
                    onSuccess={handleSuccess}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('microcycle', microcycle.id, `Week ${microcycle.absoluteWeek}`)}
                    disabled={deletingId === microcycle.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className={`h-4 w-4 ${deletingId === microcycle.id ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
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
                  <StatusBadge label="Message" hasValue={!!workout.message} />
                  <StatusBadge label="Structured" hasValue={!!workout.structured} />
                </div>
                <div className="flex items-center gap-2">
                  <ChainRunButton
                    entityType="workout"
                    entityId={workout.id}
                    onSuccess={handleSuccess}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('workout', workout.id, `workout on ${formatDate(workout.date)}`)}
                    disabled={deletingId === workout.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className={`h-4 w-4 ${deletingId === workout.id ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
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

function getDeleteApiPath(entityType: EntityType, entityId: string): string {
  switch (entityType) {
    case 'fitness-plan':
      return `/api/chains/fitness-plans/${entityId}`
    case 'microcycle':
      return `/api/chains/microcycles/${entityId}`
    case 'workout':
      return `/api/chains/workouts/${entityId}`
  }
}

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
)

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
)

function ChainToolsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Skeleton className="h-5 w-20 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-9 w-40" />
        </div>
      </Card>
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
