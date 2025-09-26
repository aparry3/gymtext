'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface WorkoutBlockItem {
  type: 'prep' | 'compound' | 'secondary' | 'accessory' | 'core' | 'cardio' | 'cooldown'
  exercise: string
  sets?: number
  reps?: string
  durationSec?: number
  durationMin?: number
  RPE?: number
  percentageRM?: number
  rest?: string
  notes?: string
}

interface WorkoutBlock {
  name: string
  items: WorkoutBlockItem[]
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: 'run' | 'lift' | 'metcon' | 'mobility' | 'rest' | 'other'
  completedAt: Date | null
  goal?: string
  details: {
    blocks?: WorkoutBlock[]
  }
  mesocycleIndex?: number
  microcycleWeek?: number
}

export default function WorkoutDetailPage() {
  const { id, workoutId } = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutInstance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Analytics tracking
  usePageView('workout_viewed', { 
    userId: id as string, 
    workoutId: workoutId as string,
    sessionType: workout?.sessionType,
    completedAt: workout?.completedAt
  })

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const apiUrl = `/api/admin/users/${id}/workouts/${workoutId}`
        console.log('Fetching workout from:', apiUrl)
        console.log('User ID:', id, 'Workout ID:', workoutId)
        
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
          setWorkout(result.data)
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

    if (id && workoutId) {
      fetchWorkout()
    }
  }, [id, workoutId])

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
          <Button onClick={() => router.push(`/admin/users/${id}`)} variant="outline">
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
                <BreadcrumbLink href="/admin/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/users/${id}`}>User Profile</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {sessionTypeLabels[workout.sessionType]} - {new Date(workout.date).toLocaleDateString()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Workout Header */}
          <WorkoutHeader workout={workout} />

          {/* Goal & Notes */}
          {workout.goal && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Goal</h3>
              <p className="text-muted-foreground">{workout.goal}</p>
            </Card>
          )}

          {/* Blocks Viewer */}
          {workout.details?.blocks && workout.details.blocks.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Workout Details</h3>
              <BlocksViewer blocks={workout.details.blocks} />
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No detailed workout information available</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkoutHeader({ workout }: { workout: WorkoutInstance }) {
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
            {new Date(workout.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {workout.mesocycleIndex !== undefined && workout.microcycleWeek !== undefined && (
            <p className="text-sm text-muted-foreground">
              Mesocycle {workout.mesocycleIndex + 1} • Week {workout.microcycleWeek}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Badge variant={workout.completedAt ? "default" : "secondary"}>
            {workout.completedAt ? 'Completed' : 'Planned'}
          </Badge>
          {workout.completedAt && (
            <p className="text-xs text-muted-foreground text-right">
              Completed {new Date(workout.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

function BlocksViewer({ blocks }: { blocks: WorkoutBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => (
        <Card key={blockIndex} className="p-6">
          <h4 className="text-lg font-semibold mb-4">{block.name}</h4>
          <div className="space-y-3">
            {block.items.map((item, itemIndex) => (
              <ExerciseItem key={itemIndex} item={item} />
            ))}
          </div>
        </Card>
      ))}
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
        <h5 className="font-medium">{item.exercise}</h5>
        
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {item.sets && (
            <span>{item.sets} sets</span>
          )}
          {item.reps && (
            <span>{item.reps} reps</span>
          )}
          {item.durationMin && (
            <span>{item.durationMin} min</span>
          )}
          {item.durationSec && (
            <span>{item.durationSec}s</span>
          )}
          {item.RPE && (
            <Badge variant="outline" className="text-xs">
              RPE {item.RPE}
            </Badge>
          )}
          {item.percentageRM && (
            <Badge variant="outline" className="text-xs">
              {item.percentageRM}% RM
            </Badge>
          )}
          {item.rest && (
            <span>Rest: {item.rest}</span>
          )}
        </div>
        
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