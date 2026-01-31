'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/shared/utils/date'
import { StructuredMicrocycleCompact } from '@/components/pages/shared/StructuredMicrocycleRenderer'
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

export default function MicrocyclesPage() {
  const { id: userId } = useParams()
  const router = useRouter()
  const [microcycles, setMicrocycles] = useState<Microcycle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMicrocycles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/microcycles`)

      if (!response.ok) {
        throw new Error('Failed to fetch microcycles')
      }

      const result = await response.json()
      if (result.success) {
        // Sort by absoluteWeek ascending
        const sorted = [...result.data].sort((a: Microcycle, b: Microcycle) => a.absoluteWeek - b.absoluteWeek)
        setMicrocycles(sorted)
      }
    } catch (err) {
      setError('Failed to load microcycles')
      console.error('Error fetching microcycles:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchMicrocycles()
    }
  }, [userId, fetchMicrocycles])

  const handleDelete = async (e: React.MouseEvent, microcycleId: string) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this microcycle? This will also delete all associated workouts. This action cannot be undone.')) {
      return
    }

    setDeletingId(microcycleId)
    try {
      const response = await fetch(`/api/chains/microcycles/${microcycleId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchMicrocycles()
      } else {
        alert(result.message || 'Failed to delete microcycle')
      }
    } catch (err) {
      console.error('Error deleting microcycle:', err)
      alert('Failed to delete microcycle')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRowClick = (microcycleId: string) => {
    router.push(`/users/${userId}/microcycles/${microcycleId}`)
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

  if (isLoading) {
    return <MicrocyclesSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-2">Error Loading Microcycles</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
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
                <BreadcrumbPage>Microcycles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Microcycles (Weeks)</h1>
            <Badge variant="outline">{microcycles.length} total</Badge>
          </div>

          {/* Microcycles Table */}
          {microcycles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No microcycles found for this user</p>
              <Link
                href={`/users/${userId}`}
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                Back to user profile
              </Link>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Week #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Phase</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date Range</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Pattern</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {microcycles.map((microcycle) => {
                      const isCurrent = isCurrentWeek(microcycle.startDate, microcycle.endDate)
                      return (
                        <tr
                          key={microcycle.id}
                          className={`hover:bg-muted/30 ${isCurrent ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}`}
                        >
                          <td
                            className={`px-4 py-3 text-sm cursor-pointer ${isCurrent ? 'font-semibold' : ''}`}
                            onClick={() => handleRowClick(microcycle.id)}
                          >
                            Week {microcycle.absoluteWeek}
                            {isCurrent && <span className="ml-2 text-xs text-primary">(Current)</span>}
                          </td>
                          <td
                            className="px-4 py-3 text-sm cursor-pointer"
                            onClick={() => handleRowClick(microcycle.id)}
                          >
                            {microcycle.structured?.phase || '-'}
                          </td>
                          <td
                            className="px-4 py-3 text-sm text-muted-foreground cursor-pointer"
                            onClick={() => handleRowClick(microcycle.id)}
                          >
                            {formatDateRange(microcycle.startDate, microcycle.endDate)}
                          </td>
                          <td
                            className="px-4 py-3 text-sm cursor-pointer"
                            onClick={() => handleRowClick(microcycle.id)}
                          >
                            <div className="flex gap-1">
                              {microcycle.isActive && (
                                <Badge variant="default">Active</Badge>
                              )}
                              {microcycle.isDeload && (
                                <Badge variant="secondary">Deload</Badge>
                              )}
                              {!microcycle.isActive && !microcycle.isDeload && (
                                <Badge variant="outline">Planned</Badge>
                              )}
                            </div>
                          </td>
                          <td
                            className="px-4 py-3 text-sm cursor-pointer"
                            onClick={() => handleRowClick(microcycle.id)}
                          >
                            <StructuredMicrocycleCompact structure={microcycle.structured} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(e, microcycle.id)}
                              disabled={deletingId === microcycle.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {deletingId === microcycle.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Back link */}
          <div className="text-center">
            <Link
              href={`/users/${userId}`}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Back to user profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function MicrocyclesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-64" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Card className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
