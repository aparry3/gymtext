'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { parseDate, formatDate } from '@/shared/utils/date'
import {
  formatMessageAgentInput,
  formatStructuredAgentInput
} from '@gymtext/shared/shared/utils/microcyclePrompts'
import { StructuredMicrocycleRenderer } from '@/components/pages/shared/StructuredMicrocycleRenderer'
import type { MicrocycleStructure } from '@/server/models/microcycle'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'

interface Microcycle {
  id: string
  clientId: string
  absoluteWeek: number
  days: string[]
  description: string | null
  isDeload: boolean
  message: string | null
  structured: MicrocycleStructure | null
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface WorkoutInstance {
  id: string
  date: Date
  sessionType: string
  completedAt: Date | null
  goal: string | null
}

export default function MicrocycleDetailPage() {
  const { id: userId, microcycleId } = useParams()
  const router = useRouter()
  const [microcycle, setMicrocycle] = useState<Microcycle | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutInstance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedTab, setCopiedTab] = useState<'message' | 'structured' | 'sms' | null>(null)

  const copyToClipboard = async (text: string, tab: 'message' | 'structured' | 'sms') => {
    await navigator.clipboard.writeText(text)
    setCopiedTab(tab)
    setTimeout(() => setCopiedTab(null), 2000)
  }

  const fetchMicrocycleData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/microcycles/${microcycleId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Microcycle not found')
        }
        throw new Error('Failed to fetch microcycle')
      }

      const result = await response.json()
      if (result.success) {
        setMicrocycle(result.data.microcycle)
        // Parse workout dates
        const parsedWorkouts = result.data.workouts.map((w: WorkoutInstance) => ({
          ...w,
          date: parseDate(w.date),
          completedAt: w.completedAt ? new Date(w.completedAt) : null
        }))
        // Sort by date
        parsedWorkouts.sort((a: WorkoutInstance, b: WorkoutInstance) => a.date.getTime() - b.date.getTime())
        setWorkouts(parsedWorkouts)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load microcycle')
      console.error('Error fetching microcycle:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, microcycleId])

  useEffect(() => {
    if (userId && microcycleId) {
      fetchMicrocycleData()
    }
  }, [userId, microcycleId, fetchMicrocycleData])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this microcycle? This will also delete all associated workouts. This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/chains/microcycles/${microcycleId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/users/${userId}/microcycles`)
      } else {
        alert(result.message || 'Failed to delete microcycle')
      }
    } catch (err) {
      console.error('Error deleting microcycle:', err)
      alert('Failed to delete microcycle')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleWorkoutClick = (workoutId: string) => {
    router.push(`/users/${userId}/program/workouts/${workoutId}`)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  const isCurrentWeek = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return now >= start && now <= end
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

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getUTCFullYear() === today.getUTCFullYear() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCDate() === today.getUTCDate()
    )
  }

  if (isLoading) {
    return <MicrocycleDetailSkeleton />
  }

  if (error || !microcycle) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-2">Error Loading Microcycle</p>
            <p className="text-sm text-muted-foreground mb-4">{error || 'Microcycle not found'}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const isCurrent = isCurrentWeek(microcycle.startDate, microcycle.endDate)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/users">Users</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/users/${userId}`}>User Details</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/users/${userId}/microcycles`}>Microcycles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Week {microcycle.absoluteWeek}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Card */}
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold">Week {microcycle.absoluteWeek}</h1>
                  {isCurrent && (
                    <Badge variant="default" className="bg-primary">Current Week</Badge>
                  )}
                  {microcycle.isActive && !isCurrent && (
                    <Badge variant="default">Active</Badge>
                  )}
                  {microcycle.isDeload && (
                    <Badge variant="secondary">Deload</Badge>
                  )}
                </div>
                {microcycle.structured?.phase && (
                  <p className="text-lg text-muted-foreground">{microcycle.structured.phase}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(microcycle.startDate, microcycle.endDate)}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Microcycle'}
              </Button>
            </div>
          </Card>

          {/* Description Section */}
          {microcycle.description && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{microcycle.description}</p>
            </Card>
          )}

          {/* Message Section */}
          {microcycle.message && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">SMS Message</h3>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(microcycle.message!, 'sms')}
                >
                  {copiedTab === 'sms' ? 'Copied!' : 'Copy'}
                </Button>
                <p className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 pr-20 rounded-md">{microcycle.message}</p>
              </div>
            </Card>
          )}

          {/* 7-Day Grid */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">Weekly Pattern</h3>
            <StructuredMicrocycleRenderer structure={microcycle.structured} showHeader={false} />
          </Card>

          {/* Agent Inputs Section */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 text-muted-foreground text-sm uppercase tracking-wide">
              Agent Inputs
            </h3>
            <Tabs defaultValue="message">
              <TabsList>
                <TabsTrigger value="message">Message Agent</TabsTrigger>
                <TabsTrigger value="structured">Structured Agent</TabsTrigger>
              </TabsList>
              <TabsContent value="message">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(
                      formatMessageAgentInput({
                        overview: microcycle.description || '',
                        days: microcycle.days || [],
                        isDeload: microcycle.isDeload
                      }),
                      'message'
                    )}
                  >
                    {copiedTab === 'message' ? 'Copied!' : 'Copy'}
                  </Button>
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/50 p-4 pr-20 rounded-md overflow-auto max-h-96">
                    {formatMessageAgentInput({
                      overview: microcycle.description || '',
                      days: microcycle.days || [],
                      isDeload: microcycle.isDeload
                    })}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="structured">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(
                      formatStructuredAgentInput(
                        microcycle.description || '',
                        microcycle.days || [],
                        microcycle.absoluteWeek,
                        microcycle.isDeload
                      ),
                      'structured'
                    )}
                  >
                    {copiedTab === 'structured' ? 'Copied!' : 'Copy'}
                  </Button>
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/50 p-4 pr-20 rounded-md overflow-auto max-h-96">
                    {formatStructuredAgentInput(
                      microcycle.description || '',
                      microcycle.days || [],
                      microcycle.absoluteWeek,
                      microcycle.isDeload
                    )}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Workouts Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Workouts This Week</h3>
              <Badge variant="outline">{workouts.length} workouts</Badge>
            </div>

            {workouts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No workouts generated for this week yet</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Session Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Goal</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {workouts.map((workout) => {
                        const isTodayWorkout = isToday(workout.date)
                        return (
                          <tr
                            key={workout.id}
                            onClick={() => handleWorkoutClick(workout.id)}
                            className={`hover:bg-muted/30 cursor-pointer ${isTodayWorkout ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
                          >
                            <td className={`px-4 py-3 text-sm ${isTodayWorkout ? 'font-semibold' : ''}`}>
                              {formatDate(workout.date)}
                              {isTodayWorkout && <span className="ml-2 text-xs text-primary">(Today)</span>}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={isTodayWorkout ? "default" : "outline"}>
                                {sessionTypeLabels[workout.sessionType] || workout.sessionType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-48 truncate">
                              {workout.goal || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant={workout.completedAt ? "default" : "secondary"}>
                                {workout.completedAt ? 'Completed' : 'Planned'}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link
              href={`/users/${userId}/microcycles`}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Back to all microcycles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function MicrocycleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-80" />

          <Card className="p-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </Card>

          <Card className="p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Card className="p-4">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
