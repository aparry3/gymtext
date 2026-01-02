'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageView } from '@/hooks/useAnalytics'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { parseDate, formatDate } from '@/shared/utils/date'

// New schema types
interface WorkoutBlockItem {
  type: 'prep' | 'compound' | 'secondary' | 'accessory' | 'core' | 'cardio' | 'cooldown'
  exercise: string
  sets?: number | null
  reps?: string | null
  durationSec?: number | null
  durationMin?: number | null
  RPE?: number | null
  rir?: number | null
  percentageRM?: number | null
  restSec?: number | null
  restText?: string | null
  equipment?: string | null
  tempo?: string | null
  cues?: string[] | null
  notes?: string | null
}

interface WorkoutWorkItem {
  structureType: 'straight' | 'superset' | 'circuit'
  exercises: WorkoutBlockItem[]
  restBetweenExercisesSec?: number | null
  restAfterSetSec?: number | null
  rounds?: number | null
  notes?: string | null
}

interface WorkoutBlock {
  name: string
  goal?: string | null
  durationMin?: number | null
  notes?: string | null
  work?: WorkoutWorkItem[]  // New schema
  items?: WorkoutBlockItem[]  // Legacy schema
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: 'run' | 'lift' | 'metcon' | 'mobility' | 'rest' | 'other'
  completedAt: Date | null
  goal?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any  // Can be legacy or new format
  blocks?: WorkoutBlock[]  // New schema (at root)
  theme?: string
  mesocycleIndex?: number
  microcycleWeek?: number
  description?: string | null
  reasoning?: string | null
  message?: string | null
}

// Helper to extract blocks from either format (for legacy workouts)
function getWorkoutBlocks(workout: WorkoutInstance): WorkoutBlock[] {
  // Try new format first (blocks at root)
  if (workout.blocks && Array.isArray(workout.blocks)) {
    return workout.blocks
  }
  // Try legacy format (blocks in details)
  if (workout.details && workout.details.blocks && Array.isArray(workout.details.blocks)) {
    return workout.details.blocks
  }
  return []
}

// Helper to get all exercises from a block (handles both formats)
function getBlockExercises(block: WorkoutBlock): WorkoutBlockItem[] {
  const exercises: WorkoutBlockItem[] = []

  // New format: extract from work items
  if (block.work && Array.isArray(block.work)) {
    for (const workItem of block.work) {
      if (workItem.exercises && Array.isArray(workItem.exercises)) {
        exercises.push(...workItem.exercises)
      }
    }
  }

  // Legacy format: direct items array
  if (block.items && Array.isArray(block.items)) {
    exercises.push(...block.items)
  }

  return exercises
}

interface WorkoutDetailViewProps {
  userId: string
  workoutId: string
  basePath: string
  showAdminActions?: boolean
}

export function WorkoutDetailView({ userId, workoutId, basePath, showAdminActions = true }: WorkoutDetailViewProps) {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutInstance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Analytics tracking
  usePageView('workout_viewed', {
    userId,
    workoutId,
    sessionType: workout?.sessionType,
    completedAt: workout?.completedAt
  })

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const apiUrl = `/api/users/${userId}/workouts/${workoutId}`
        console.log('Fetching workout from:', apiUrl)
        console.log('User ID:', userId, 'Workout ID:', workoutId)

        const response = await fetch(apiUrl)
        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error Response:', errorText)
          throw new Error(`Failed to fetch workout: ${response.status}`)
        }

        const result = await response.json()
        console.log('API Result:', result)

        if (result.success) {
          // Parse dates when loading
          const workout = {
            ...result.data,
            date: parseDate(result.data.date),
            completedAt: result.data.completedAt ? new Date(result.data.completedAt) : null
          }
          setWorkout(workout)
        } else {
          setError(result.message || 'Failed to load workout')
        }
      } catch (err) {
        console.error('Error fetching workout:', err)
        setError('Failed to load workout data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkout()
  }, [userId, workoutId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${userId}/workouts/${workoutId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        const path = basePath === '/me' ? '/me' : `${basePath}/${userId}`
        router.push(path)
      } else{
        alert(result.message || 'Failed to delete workout')
      }
    } catch (err) {
      console.error('Error deleting workout:', err)
      alert('Failed to delete workout')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <WorkoutDetailSkeleton />
  }

  if (error || !workout) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'Workout not found'}
          </p>
          <Button onClick={() => router.push(basePath === '/me' ? '/me' : `${basePath}/${userId}`)} variant="outline">
            Back to User
          </Button>
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={basePath === '/me' ? '/me' : '/admin/users'}>
                  {basePath === '/me' ? 'My Profile' : 'Users'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {basePath !== '/me' && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`${basePath}/${userId}`}>User Profile</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {sessionTypeLabels[workout.sessionType]} - {formatDate(workout.date)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Workout Header */}
          <WorkoutHeader workout={workout} onDelete={handleDelete} isDeleting={isDeleting} showAdminActions={showAdminActions} />

          {/* Workout Summary Statistics */}
          {getWorkoutBlocks(workout).length > 0 && (
            <WorkoutSummaryCard workout={workout} />
          )}

          {/* Goal & Notes */}
          {workout.goal && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Goal</h3>
              <p className="text-muted-foreground">{workout.goal}</p>
            </Card>
          )}

          {/* Tabbed Content */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Workout Details</h3>
            <Tabs defaultValue="blocks" className="w-full">
              <TabsList>
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                <TabsTrigger value="message">Message</TabsTrigger>
              </TabsList>

              {/* Blocks View */}
              <TabsContent value="blocks">
                {getWorkoutBlocks(workout).length > 0 ? (
                  <BlocksViewer blocks={getWorkoutBlocks(workout)} />
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No workout blocks available</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="description">
                <Card className="p-6">
                  {workout.description ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{workout.description}</p>
                  ) : (
                    <p className="text-muted-foreground text-center">No description available</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="reasoning">
                <Card className="p-6">
                  {workout.reasoning ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{workout.reasoning}</p>
                  ) : (
                    <p className="text-muted-foreground text-center">No reasoning available</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="message">
                <Card className="p-6">
                  {workout.message ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{workout.message}</p>
                  ) : (
                    <p className="text-muted-foreground text-center">No message available</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkoutSummaryCard({ workout }: { workout: WorkoutInstance }) {
  const blocks = getWorkoutBlocks(workout)

  // Calculate statistics using helper to get exercises
  const totalExercises = blocks.reduce((sum, block) => sum + getBlockExercises(block).length, 0)

  const totalSets = blocks.reduce((sum, block) => {
    const exercises = getBlockExercises(block)
    return sum + exercises.reduce((itemSum, item) => itemSum + (item.sets || 0), 0)
  }, 0)

  // Count exercises by type
  const exercisesByType = blocks.reduce((acc, block) => {
    const exercises = getBlockExercises(block)
    exercises.forEach((item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Estimate total duration (rough)
  const estimatedDuration = blocks.reduce((sum, block) => {
    const exercises = getBlockExercises(block)
    return (
      sum +
      exercises.reduce((itemSum, item) => {
        // Filter out sentinel value -1
        if (item.durationMin && item.durationMin > 0) return itemSum + item.durationMin
        if (item.durationSec && item.durationSec > 0) return itemSum + item.durationSec / 60
        // Rough estimate: sets * (work + rest) in minutes
        if (item.sets && item.sets > 0) {
          // Use restSec or restText if available (filter sentinel -1)
          const restMin = (item.restSec && item.restSec > 0) ? item.restSec / 60 :
                          item.restText ? parseFloat(item.restText) / 60 : 1.5 // default 90sec rest
          return itemSum + item.sets * (0.5 + restMin) // assume 30sec work time
        }
        return itemSum
      }, 0)
    )
  }, 0)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Workout Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-700 mb-1">Total Blocks</div>
          <div className="text-2xl font-bold text-blue-900">{blocks.length}</div>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700 mb-1">Total Exercises</div>
          <div className="text-2xl font-bold text-green-900">{totalExercises}</div>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-700 mb-1">Total Sets</div>
          <div className="text-2xl font-bold text-purple-900">{totalSets}</div>
        </div>

        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-sm text-orange-700 mb-1">Est. Duration</div>
          <div className="text-2xl font-bold text-orange-900">{Math.round(estimatedDuration)}m</div>
        </div>
      </div>

      {Object.keys(exercisesByType).length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Exercise Breakdown</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(exercisesByType).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function WorkoutHeader({
  workout,
  onDelete,
  isDeleting,
  showAdminActions = true
}: {
  workout: WorkoutInstance
  onDelete: () => void
  isDeleting: boolean
  showAdminActions?: boolean
}) {
  const sessionTypeLabels = {
    run: 'Run',
    lift: 'Lift',
    metcon: 'MetCon',
    mobility: 'Mobility',
    rest: 'Rest',
    other: 'Other'
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {sessionTypeLabels[workout.sessionType]} Workout
          </h1>
          <p className="text-muted-foreground">
            {formatDate(workout.date, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {workout.mesocycleIndex !== undefined && workout.microcycleWeek !== undefined && (
            <p className="text-sm text-muted-foreground">
              Mesocycle {workout.mesocycleIndex + 1} • Week {workout.microcycleWeek + 1}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <Badge variant={workout.completedAt ? "default" : "secondary"}>
            {workout.completedAt ? 'Completed' : 'Planned'}
          </Badge>
          {workout.completedAt && (
            <p className="text-xs text-muted-foreground text-right">
              Completed {new Date(workout.completedAt).toLocaleDateString()}
            </p>
          )}
          {showAdminActions && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="mt-2"
            >
              {isDeleting ? 'Deleting...' : 'Delete Workout'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function BlocksViewer({ blocks }: { blocks: WorkoutBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => {
        const exercises = getBlockExercises(block)

        return (
          <Card key={blockIndex} className="p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold">{block.name}</h4>
              {block.goal && (
                <p className="text-sm text-muted-foreground mt-1">{block.goal}</p>
              )}
            </div>

            {/* Render work items with structure type indicators */}
            {block.work && block.work.length > 0 ? (
              <div className="space-y-4">
                {block.work.map((workItem, workIdx) => (
                  <div key={workIdx} className="space-y-3">
                    {workItem.structureType !== 'straight' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {workItem.structureType}
                        </Badge>
                        {workItem.rounds && (
                          <span className="text-xs text-muted-foreground">
                            {workItem.rounds} rounds
                          </span>
                        )}
                      </div>
                    )}
                    {workItem.exercises.map((item, itemIndex) => (
                      <ExerciseItem key={itemIndex} item={item} />
                    ))}
                    {workItem.notes && (
                      <p className="text-sm text-muted-foreground italic mt-2">
                        {workItem.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Legacy format: just show items directly
              <div className="space-y-3">
                {exercises.map((item, itemIndex) => (
                  <ExerciseItem key={itemIndex} item={item} />
                ))}
              </div>
            )}

            {block.notes && (
              <p className="text-sm text-muted-foreground italic mt-4 pt-4 border-t">
                {block.notes}
              </p>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function ExerciseItem({ item }: { item: WorkoutBlockItem }) {
  const typeColors = {
    prep: 'bg-blue-50 text-blue-700',
    compound: 'bg-red-50 text-red-700',
    secondary: 'bg-orange-50 text-orange-700',
    accessory: 'bg-green-50 text-green-700',
    core: 'bg-purple-50 text-purple-700',
    cardio: 'bg-pink-50 text-pink-700',
    cooldown: 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <Badge variant="outline" className={`text-xs ${typeColors[item.type]}`}>
        {item.type}
      </Badge>

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <h5 className="font-medium">{item.exercise}</h5>
          {item.equipment && (
            <span className="text-xs text-muted-foreground">{item.equipment}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {item.sets && item.sets > 0 && (
            <span>{item.sets} sets</span>
          )}
          {item.reps && item.reps !== "" && (
            <span>{item.reps} reps</span>
          )}
          {item.durationMin && item.durationMin > 0 && (
            <span>{item.durationMin} min</span>
          )}
          {item.durationSec && item.durationSec > 0 && (
            <span>{item.durationSec}s</span>
          )}
          {item.RPE && item.RPE > 0 && item.RPE <= 10 && (
            <Badge variant="outline" className="text-xs">
              RPE {item.RPE}
            </Badge>
          )}
          {item.rir !== undefined && item.rir !== null && item.rir >= 0 && (
            <Badge variant="outline" className="text-xs">
              RIR {item.rir}
            </Badge>
          )}
          {item.percentageRM && item.percentageRM > 0 && item.percentageRM <= 100 && (
            <Badge variant="outline" className="text-xs">
              {item.percentageRM}% RM
            </Badge>
          )}
          {item.tempo && item.tempo !== "" && (
            <span>Tempo: {item.tempo}</span>
          )}
          {item.restSec && item.restSec > 0 && (
            <span>Rest: {item.restSec}s</span>
          )}
          {item.restText && item.restText !== "" && (
            <span>Rest: {item.restText}</span>
          )}
        </div>

        {item.cues && item.cues.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <strong>Cues:</strong> {item.cues.join(' • ')}
          </div>
        )}

        {item.notes && (
          <p className="text-sm text-muted-foreground italic">{item.notes}</p>
        )}
      </div>
    </div>
  )
}

function WorkoutDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-96" />
          
          <Card className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-12 w-full" />
          </Card>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}