'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { parseDate, formatDate } from '@/shared/utils/date'
import { StructuredMicrocycleRenderer } from './StructuredMicrocycleRenderer'
import type { MicrocycleStructure } from '@/server/models/microcycle'

interface DayPattern {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  theme: string
  load?: 'light' | 'moderate' | 'heavy'
  notes?: string
}

interface Microcycle {
  id: string
  weekNumber: number
  pattern?: {
    weekIndex: number
    days: DayPattern[]
  }
  structured?: MicrocycleStructure | null
  description?: string | null
  isDeload?: boolean
  message?: string | null
  startDate: Date
  endDate: Date
  isActive: boolean
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: 'run' | 'lift' | 'metcon' | 'mobility' | 'rest' | 'other'
  completedAt: Date | null
}

interface FitnessPlan {
  mesocycles: Array<{
    name: string
    microcycles?: string[]
    weeks?: number
    durationWeeks?: number
    objective?: string
  }>
}

interface MicrocycleWeekViewProps {
  userId: string
  mesocycleIndex: number
  weekNumber: number
  basePath: string
}

export function MicrocycleWeekView({ userId, mesocycleIndex, weekNumber, basePath }: MicrocycleWeekViewProps) {
  const router = useRouter()
  const [microcycle, setMicrocycle] = useState<Microcycle | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutInstance[]>([])
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [microcycleResponse, planResponse] = await Promise.all([
          fetch(`/api/users/${userId}/microcycle?mesocycleIndex=${mesocycleIndex}&weekNumber=${weekNumber}`),
          fetch(`/api/users/${userId}/fitness-plan`)
        ])

        // Handle plan response
        if (planResponse.ok) {
          const planResult = await planResponse.json()
          if (planResult.success) {
            setFitnessPlan(planResult.data)
          }
        }

        // Handle microcycle response
        if (microcycleResponse.ok) {
          const microcycleResult = await microcycleResponse.json()
          if (microcycleResult.success) {
            // Parse microcycle dates
            const microcycle = {
              ...microcycleResult.data,
              startDate: parseDate(microcycleResult.data.startDate),
              endDate: parseDate(microcycleResult.data.endDate)
            }
            setMicrocycle(microcycle)

            // Now fetch workouts using the microcycle date range
            const startDate = microcycleResult.data.startDate
            const endDate = microcycleResult.data.endDate
            const workoutsResponse = await fetch(
              `/api/users/${userId}/workouts?startDate=${startDate}&endDate=${endDate}`
            )

            if (workoutsResponse.ok) {
              const workoutsResult = await workoutsResponse.json()
              if (workoutsResult.success) {
                // Parse workout dates
                const workouts = workoutsResult.data.map((w: WorkoutInstance) => ({
                  ...w,
                  date: parseDate(w.date),
                  completedAt: w.completedAt ? new Date(w.completedAt) : null
                }))
                setWorkouts(workouts)
              }
            }
          }
        }
      } catch (err) {
        setError('Failed to load microcycle data')
        console.error('Error fetching microcycle data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, mesocycleIndex, weekNumber])

  if (isLoading) {
    return <MicrocycleWeekSkeleton />
  }

  if (error || !microcycle) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'Microcycle not found'}
          </p>
          <Button
            onClick={() => {
              const path = basePath === '/me'
                ? `/me/program/mesocycles/${mesocycleIndex}`
                : `${basePath}/${userId}/program/mesocycles/${mesocycleIndex}`
              router.push(path)
            }}
            variant="outline"
          >
            Back to Mesocycle
          </Button>
        </div>
      </div>
    )
  }

  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  // Get the microcycle description for this week from the mesocycle
  const mesocycle = fitnessPlan?.mesocycles[mesocycleIndex]
  const microcycleDescription = mesocycle?.microcycles?.[weekNumber]

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={basePath === '/me' ? '/me' : '/users'}>
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
                <BreadcrumbLink href={basePath === '/me' ? `/me/program/mesocycles/${mesocycleIndex}` : `${basePath}/${userId}/program/mesocycles/${mesocycleIndex}`}>
                  Mesocycle {mesocycleIndex + 1}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Week {weekNumber + 1}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Microcycle Header */}
          <MicrocycleHeader microcycle={microcycle} />

          {/* Structured Microcycle Overview */}
          {microcycle.structured && (
            <Card className="p-6">
              <StructuredMicrocycleRenderer structure={microcycle.structured} showHeader={false} />
            </Card>
          )}

          {/* Legacy: Microcycle Description (old format) */}
          {!microcycle.structured && microcycleDescription && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Week Overview</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{microcycleDescription}</p>
            </Card>
          )}

          {/* Legacy: Day Cards (old format - only shown if no structured content) */}
          {!microcycle.structured && microcycle.pattern && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Training Schedule</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {weekDays.map((dayName) => {
                  const dayPattern = microcycle.pattern!.days.find(d => d.day === dayName)
                  const dayWorkouts = getWorkoutsForDay(workouts, microcycle, dayName)

                  return (
                    <DayCard
                      key={dayName}
                      dayName={dayName}
                      dayPattern={dayPattern}
                      workouts={dayWorkouts}
                      userId={userId}
                      basePath={basePath}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MicrocycleHeader({ microcycle }: { microcycle: Microcycle }) {
  const startDate = formatDate(microcycle.startDate)
  const endDate = formatDate(microcycle.endDate)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Week {(microcycle.pattern?.weekIndex ?? microcycle.weekNumber) + 1}</h1>
          <p className="text-muted-foreground">
            {startDate} - {endDate}
          </p>
        </div>
        <div className="flex gap-2">
          {microcycle.isDeload && (
            <Badge variant="secondary">Deload</Badge>
          )}
          {microcycle.isActive && (
            <Badge variant="default">Active</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

interface DayCardProps {
  dayName: string
  dayPattern?: DayPattern
  workouts: WorkoutInstance[]
  userId: string
  basePath: string
}

function DayCard({ dayName, dayPattern, workouts, userId, basePath }: DayCardProps) {
  const router = useRouter()

  const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase()
  
  const loadColors = {
    light: 'bg-green-50 text-green-700 border-green-200',
    moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    heavy: 'bg-red-50 text-red-700 border-red-200'
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
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium">{dayLabel}</h4>
          {dayPattern ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{dayPattern.theme}</p>
              {dayPattern.load && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${loadColors[dayPattern.load]}`}
                >
                  {dayPattern.load}
                </Badge>
              )}
              {dayPattern.notes && (
                <p className="text-xs text-muted-foreground">{dayPattern.notes}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pattern</p>
          )}
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium">Workouts</h5>
          {workouts.length > 0 ? (
            <div className="space-y-1">
              {workouts.map((workout) => (
                <button
                  key={workout.id}
                  onClick={() => {
                    const path = basePath === '/me'
                      ? `/me/program/workouts/${workout.id}`
                      : `${basePath}/${userId}/program/workouts/${workout.id}`
                    router.push(path)
                  }}
                  className="w-full"
                >
                  <Badge
                    variant={workout.completedAt ? "default" : "outline"}
                    className="text-xs w-full justify-center cursor-pointer hover:opacity-80"
                  >
                    {sessionTypeLabels[workout.sessionType] || workout.sessionType || 'Workout'}
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No workouts on this day</p>
          )}
        </div>
      </div>
    </Card>
  )
}

function getWorkoutsForDay(workouts: WorkoutInstance[], microcycle: Microcycle, dayName: string): WorkoutInstance[] {
  // microcycle.startDate is already a Date object (parsed on load)
  const startDate = microcycle.startDate
  const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(dayName)

  // Calculate target date using UTC methods
  const targetDate = new Date(startDate)
  targetDate.setUTCDate(startDate.getUTCDate() + dayIndex)

  // Filter workouts by comparing UTC date components
  return workouts.filter(workout => {
    return (
      workout.date.getUTCFullYear() === targetDate.getUTCFullYear() &&
      workout.date.getUTCMonth() === targetDate.getUTCMonth() &&
      workout.date.getUTCDate() === targetDate.getUTCDate()
    )
  })
}

function MicrocycleWeekSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-96" />
          
          <Card className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </Card>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-24 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}