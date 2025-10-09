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

interface DayPattern {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  theme: string
  load?: 'light' | 'moderate' | 'heavy'
  notes?: string
}

interface Microcycle {
  id: string
  weekNumber: number
  pattern: {
    weekIndex: number
    days: DayPattern[]
  }
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

export default function MicrocycleWeekPage() {
  const { id, idx, week } = useParams()
  const router = useRouter()
  const [microcycle, setMicrocycle] = useState<Microcycle | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mesocycleIndex = parseInt(idx as string, 10)
  const weekNumber = parseInt(week as string, 10)

  // Analytics tracking
  usePageView('microcycle_viewed', { 
    userId: id as string, 
    mesocycleIndex, 
    weekNumber,
    microcycleId: microcycle?.id 
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const microcycleResponse = await fetch(
          `/api/admin/users/${id}/microcycle?mesocycleIndex=${mesocycleIndex}&weekNumber=${weekNumber}`
        )

        if (microcycleResponse.ok) {
          const microcycleResult = await microcycleResponse.json()
          if (microcycleResult.success) {
            setMicrocycle(microcycleResult.data)
            
            // Now fetch workouts using the microcycle date range
            const startDate = microcycleResult.data.startDate
            const endDate = microcycleResult.data.endDate
            const workoutsResponse = await fetch(
              `/api/admin/users/${id}/workouts?startDate=${startDate}&endDate=${endDate}`
            )

            if (workoutsResponse.ok) {
              const workoutsResult = await workoutsResponse.json()
              if (workoutsResult.success) {
                setWorkouts(workoutsResult.data)
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

    if (id && !isNaN(mesocycleIndex) && !isNaN(weekNumber)) {
      fetchData()
    }
  }, [id, mesocycleIndex, weekNumber])

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
            onClick={() => router.push(`/admin/users/${id}/program/mesocycles/${idx}`)} 
            variant="outline"
          >
            Back to Mesocycle
          </Button>
        </div>
      </div>
    )
  }

  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
                <BreadcrumbLink href={`/admin/users/${id}/program/mesocycles/${idx}`}>
                  Mesocycle {mesocycleIndex}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Week {weekNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Microcycle Header */}
          <MicrocycleHeader microcycle={microcycle} />

          {/* Day Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Training Schedule</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {weekDays.map((dayName) => {
                const dayPattern = microcycle.pattern.days.find(d => d.day === dayName)
                const dayWorkouts = getWorkoutsForDay(workouts, microcycle, dayName)
                
                return (
                  <DayCard 
                    key={dayName}
                    dayName={dayName}
                    dayPattern={dayPattern}
                    workouts={dayWorkouts}
                    userId={id as string}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MicrocycleHeader({ microcycle }: { microcycle: Microcycle }) {
  const startDate = new Date(microcycle.startDate).toLocaleDateString()
  const endDate = new Date(microcycle.endDate).toLocaleDateString()

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Week {microcycle.pattern.weekIndex}</h1>
          <p className="text-muted-foreground">
            {startDate} - {endDate}
          </p>
        </div>
        <div className="flex gap-2">
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
}

function DayCard({ dayName, dayPattern, workouts, userId }: DayCardProps) {
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
                  onClick={() => router.push(`/admin/users/${userId}/program/workouts/${workout.id}`)}
                  className="w-full"
                >
                  <Badge 
                    variant={workout.completedAt ? "default" : "outline"}
                    className="text-xs w-full justify-center cursor-pointer hover:opacity-80"
                  >
                    {sessionTypeLabels[workout.sessionType]}
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
  const startDate = new Date(microcycle.startDate)
  const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(dayName)
  
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + dayIndex)
  
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date)
    return workoutDate.toDateString() === targetDate.toDateString()
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