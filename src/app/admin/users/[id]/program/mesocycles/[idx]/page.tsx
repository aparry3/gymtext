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

interface Mesocycle {
  name: string
  weeks: number
  focus: string[]
  deload: boolean
}

interface Microcycle {
  id: string
  weekNumber: number
  pattern: {
    weekIndex: number
    days: Array<{
      day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
      theme: string
      load?: 'light' | 'moderate' | 'heavy'
      notes?: string
    }>
  }
  startDate: Date
  endDate: Date
  isActive: boolean
}

interface FitnessPlan {
  id: string
  mesocycles: Mesocycle[]
  currentMesocycleIndex: number
  currentMicrocycleWeek: number
}

export default function MesocycleDetailPage() {
  const { id, idx } = useParams()
  const router = useRouter()
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null)
  const [microcycles, setMicrocycles] = useState<Microcycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mesocycleIndex = parseInt(idx as string, 10)
  const mesocycle = fitnessPlan?.mesocycles[mesocycleIndex]

  // Analytics tracking
  usePageView('mesocycle_viewed', { 
    userId: id as string, 
    mesocycleIndex,
    fitnessPlanId: fitnessPlan?.id 
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [planResponse, microcyclesResponse] = await Promise.all([
          fetch(`/api/admin/users/${id}/fitness-plan`),
          fetch(`/api/admin/users/${id}/microcycles?mesocycleIndex=${mesocycleIndex}`)
        ])

        if (!planResponse.ok) {
          throw new Error('Failed to fetch fitness plan')
        }

        const planResult = await planResponse.json()
        if (planResult.success) {
          setFitnessPlan(planResult.data)
        }

        if (microcyclesResponse.ok) {
          const microcyclesResult = await microcyclesResponse.json()
          if (microcyclesResult.success) {
            setMicrocycles(microcyclesResult.data)
          }
        }
      } catch (err) {
        setError('Failed to load mesocycle data')
        console.error('Error fetching mesocycle data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id && !isNaN(mesocycleIndex)) {
      fetchData()
    }
  }, [id, mesocycleIndex])

  if (isLoading) {
    return <MesocycleDetailSkeleton />
  }

  if (error || !fitnessPlan || !mesocycle) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error || 'Mesocycle not found'}
          </p>
          <Button onClick={() => router.push(`/admin/users/${id}`)} variant="outline">
            Back to User
          </Button>
        </div>
      </div>
    )
  }

  const isCurrent = mesocycleIndex === fitnessPlan.currentMesocycleIndex

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
                <BreadcrumbPage>Mesocycle {mesocycleIndex + 1}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Mesocycle Header */}
          <MesocycleHeader 
            mesocycle={mesocycle} 
            index={mesocycleIndex}
            total={fitnessPlan.mesocycles.length}
            isCurrent={isCurrent}
          />

          {/* Week Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Weeks</h3>
            {microcycles.length > 0 ? (
              <WeekGrid 
                mesocycle={mesocycle}
                microcycles={microcycles}
                userId={id as string}
                mesocycleIndex={mesocycleIndex}
                currentWeek={isCurrent ? fitnessPlan.currentMicrocycleWeek : -1}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No microcycles saved for this mesocycle yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MesocycleHeaderProps {
  mesocycle: Mesocycle
  index: number
  total: number
  isCurrent: boolean
}

function MesocycleHeader({ mesocycle, index, total, isCurrent }: MesocycleHeaderProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold">{mesocycle.name}</h1>
            <p className="text-muted-foreground">
              Mesocycle {index + 1} of {total} • {mesocycle.weeks} weeks
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {mesocycle.focus.map((focus, idx) => (
              <Badge key={idx} variant="outline">
                {focus}
              </Badge>
            ))}
            {mesocycle.deload && (
              <Badge variant="secondary">Deload</Badge>
            )}
            {isCurrent && (
              <Badge variant="default">Current</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface WeekGridProps {
  mesocycle: Mesocycle
  microcycles: Microcycle[]
  userId: string
  mesocycleIndex: number
  currentWeek: number
}

function WeekGrid({ mesocycle, microcycles, userId, mesocycleIndex, currentWeek }: WeekGridProps) {
  const router = useRouter()

  const getWeekStatus = (weekNumber: number) => {
    if (currentWeek === -1) return 'upcoming'
    if (weekNumber < currentWeek + 1) return 'past' // currentWeek is 0-based, weekNumber is 1-based for display
    if (weekNumber === currentWeek + 1) return 'current'
    return 'upcoming'
  }

  const getLoadSummary = (microcycle: Microcycle) => {
    const loads = microcycle.pattern.days
      .map(day => day.load)
      .filter(load => load)

    const loadCounts = loads.reduce((acc, load) => {
      if (load) acc[load] = (acc[load] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(loadCounts)
      .map(([load, count]) => `${count} ${load}`)
      .join(', ')
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: mesocycle.weeks }).map((_, weekIndex) => {
        const weekNumber = weekIndex + 1
        const microcycle = microcycles.find(m => m.pattern.weekIndex === weekIndex)
        const status = getWeekStatus(weekNumber)
        
        const statusColors = {
          past: 'bg-gray-50 border-gray-200',
          current: 'bg-blue-50 border-blue-200 ring-2 ring-blue-100',
          upcoming: 'bg-white border-gray-200'
        }

        const statusLabels = {
          past: 'Past',
          current: 'Current',
          upcoming: 'Upcoming'
        }

        return (
          <Card 
            key={weekIndex} 
            className={`p-4 cursor-pointer hover:shadow-md transition-all ${statusColors[status]}`}
            onClick={() => {
              if (microcycle) {
                router.push(`/admin/users/${userId}/program/mesocycles/${mesocycleIndex}/weeks/${weekNumber}`)
              }
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Week {weekNumber}</h4>
                <Badge 
                  variant={status === 'current' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {statusLabels[status]}
                </Badge>
              </div>
              
              {microcycle ? (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {getLoadSummary(microcycle) || 'Mixed loads'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(microcycle.startDate).toLocaleDateString()} - {new Date(microcycle.endDate).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">No pattern saved</p>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function MesocycleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-64" />
          
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}