'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
import { AdminProgram, AdminEnrollment, OwnerType, EnrollmentSort } from '@/components/admin/types'
import { EnrollmentsTable } from '@/components/admin/EnrollmentsTable'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { formatRelative } from '@/shared/utils/date'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface ProgramDetail extends AdminProgram {
  owner: {
    id: string
    displayName: string
    ownerType: OwnerType
    avatarUrl: string | null
  }
}

export default function ProgramDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { mode } = useEnvironment()
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [enrollmentSort, setEnrollmentSort] = useState<EnrollmentSort>({ field: 'enrolledAt', direction: 'desc' })
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isActive: true,
    isPublic: false,
  })

  // Fetch program data
  const fetchProgram = useCallback(async (programId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/programs/${programId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch program')
      }

      const data = result.data
      setProgram({ ...data.program, owner: data.owner })
      setEnrollments(data.enrollments)
      setEditForm({
        name: data.program.name,
        description: data.program.description || '',
        isActive: data.program.isActive,
        isPublic: data.program.isPublic,
      })
    } catch (err) {
      setError('Failed to load program')
      console.error('Error fetching program:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchProgram(id as string)
    }
  }, [id, fetchProgram, mode])

  const handleSave = async () => {
    if (!program) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update program')
      }

      // Refresh data
      await fetchProgram(program.id)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (program) {
      setEditForm({
        name: program.name,
        description: program.description || '',
        isActive: program.isActive,
        isPublic: program.isPublic,
      })
    }
    setIsEditing(false)
  }

  const handleEnrollmentAction = async (enrollmentId: string, action: 'pause' | 'resume' | 'cancel' | 'complete') => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${action} enrollment`)
      }

      // Refresh program data to get updated enrollments
      if (program) {
        await fetchProgram(program.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} enrollment`)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error && !program) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => router.push('/programs')}>
              Back to Programs
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!program) return null

  const ownerInitials = program.owner.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const ownerTypeColors: Record<OwnerType, string> = {
    coach: 'bg-blue-100 text-blue-800',
    trainer: 'bg-green-100 text-green-800',
    influencer: 'bg-orange-100 text-orange-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  const modeLabels: Record<string, string> = {
    rolling_start: 'Rolling Start',
    cohort: 'Cohort',
  }

  const cadenceLabels: Record<string, string> = {
    calendar_days: 'Calendar Days',
    training_days_only: 'Training Days Only',
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/programs">Programs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{program.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Program Header Card */}
        <Card className="p-6">
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Program Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={editForm.isPublic}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                      Public
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{program.name}</h1>
                  <Badge variant={program.isActive ? 'default' : 'secondary'}>
                    {program.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {program.isPublic && (
                    <Badge variant="outline">Public</Badge>
                  )}
                </div>
                {program.description && (
                  <p className="text-muted-foreground">{program.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Mode: <strong>{modeLabels[program.schedulingMode]}</strong></span>
                  <span>Cadence: <strong>{cadenceLabels[program.cadence]}</strong></span>
                  <span>Created {formatRelative(program.createdAt)}</span>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Owner Card */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {program.owner.avatarUrl ? (
                <AvatarImage src={program.owner.avatarUrl} alt={program.owner.displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{program.owner.displayName}</span>
                <Badge className={`${ownerTypeColors[program.owner.ownerType]} border-0 text-xs`}>
                  {program.owner.ownerType}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">Program Owner</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => router.push(`/program-owners/${program.owner.id}`)}
            >
              View Owner
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{program.enrollmentCount}</div>
            <div className="text-sm text-muted-foreground">Active Enrollments</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{program.versionCount}</div>
            <div className="text-sm text-muted-foreground">Plan Versions</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="enrollments">
          <TabsList>
            <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="enrollments" className="mt-4">
            <EnrollmentsTable
              enrollments={enrollments}
              sort={enrollmentSort}
              onSortChange={setEnrollmentSort}
              onAction={handleEnrollmentAction}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6">
            <Skeleton className="h-12 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </div>
    </div>
  )
}
