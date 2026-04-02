'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  AdminProgram,
  AdminEnrollment,
  AdminProgramVersion,
  OwnerType,
  EnrollmentSort,
  SchedulingMode,
  ProgramCadence,
  BillingModel,
  LateJoinerPolicy,
} from '@/components/admin/types'
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
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [versions, setVersions] = useState<AdminProgramVersion[]>([])
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

  // Settings editing state
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    schedulingMode: 'rolling_start' as SchedulingMode,
    cadence: 'calendar_days' as ProgramCadence,
    billingModel: '' as BillingModel | '',
    lateJoinerPolicy: '' as LateJoinerPolicy | '',
  })

  // Version creation state
  const [isCreatingVersion, setIsCreatingVersion] = useState(false)

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
      setVersions(data.versions || [])
      setEnrollments(data.enrollments)
      setEditForm({
        name: data.program.name,
        description: data.program.description || '',
        isActive: data.program.isActive,
        isPublic: data.program.isPublic,
      })
      setSettingsForm({
        schedulingMode: data.program.schedulingMode,
        cadence: data.program.cadence,
        billingModel: data.program.billingModel || '',
        lateJoinerPolicy: data.program.lateJoinerPolicy || '',
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
  }, [id, fetchProgram])

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

  const handleSaveSettings = async () => {
    if (!program) return

    setIsSavingSettings(true)
    setError(null)

    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedulingMode: settingsForm.schedulingMode,
          cadence: settingsForm.cadence,
          billingModel: settingsForm.billingModel || null,
          lateJoinerPolicy: settingsForm.lateJoinerPolicy || null,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update settings')
      }

      await fetchProgram(program.id)
      setIsEditingSettings(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleCancelSettings = () => {
    if (program) {
      setSettingsForm({
        schedulingMode: program.schedulingMode,
        cadence: program.cadence,
        billingModel: program.billingModel || '',
        lateJoinerPolicy: program.lateJoinerPolicy || '',
      })
    }
    setIsEditingSettings(false)
  }

  const handleCreateDraft = async () => {
    if (!program) return

    setIsCreatingVersion(true)
    setError(null)

    try {
      const response = await fetch(`/api/programs/${program.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create draft')
      }

      await fetchProgram(program.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft')
    } finally {
      setIsCreatingVersion(false)
    }
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

  const billingLabels: Record<string, string> = {
    subscription: 'Subscription',
    one_time: 'One Time',
    free: 'Free',
  }

  const lateJoinerLabels: Record<string, string> = {
    start_from_beginning: 'Start From Beginning',
    join_current_week: 'Join Current Week',
  }

  const versionStatusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
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
                  {!program.publishedVersionId && (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      Unpublished
                    </Badge>
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
        <Tabs defaultValue="versions">
          <TabsList>
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Versions Tab */}
          <TabsContent value="versions" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateDraft}
                  disabled={isCreatingVersion}
                >
                  {isCreatingVersion ? 'Creating...' : 'Create Draft'}
                </Button>
              </div>

              {versions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No versions yet. Create a draft to get started.</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Card
                      key={version.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/programs/${program.id}/versions/${version.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">v{version.versionNumber}</span>
                          <Badge className={`${versionStatusColors[version.status]} border-0 text-xs`}>
                            {version.status}
                          </Badge>
                          {version.id === program.publishedVersionId && (
                            <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {version.publishedAt && (
                            <span>Published {formatRelative(version.publishedAt)}</span>
                          )}
                          <span>Created {formatRelative(version.createdAt)}</span>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments" className="mt-4">
            <EnrollmentsTable
              enrollments={enrollments}
              sort={enrollmentSort}
              onSortChange={setEnrollmentSort}
              onAction={handleEnrollmentAction}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Program Settings</h3>
                {!isEditingSettings ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingSettings(true)}>
                    Edit Settings
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveSettings} disabled={isSavingSettings}>
                      {isSavingSettings ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelSettings} disabled={isSavingSettings}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {isEditingSettings ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Scheduling Mode</label>
                    <select
                      value={settingsForm.schedulingMode}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, schedulingMode: e.target.value as SchedulingMode }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="rolling_start">Rolling Start</option>
                      <option value="cohort">Cohort</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Cadence</label>
                    <select
                      value={settingsForm.cadence}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, cadence: e.target.value as ProgramCadence }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="calendar_days">Calendar Days</option>
                      <option value="training_days_only">Training Days Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Billing Model</label>
                    <select
                      value={settingsForm.billingModel}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, billingModel: e.target.value as BillingModel | '' }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Not Set</option>
                      <option value="subscription">Subscription</option>
                      <option value="one_time">One Time</option>
                      <option value="free">Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Late Joiner Policy</label>
                    <select
                      value={settingsForm.lateJoinerPolicy}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, lateJoinerPolicy: e.target.value as LateJoinerPolicy | '' }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Not Set</option>
                      <option value="start_from_beginning">Start From Beginning</option>
                      <option value="join_current_week">Join Current Week</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Scheduling Mode</span>
                    <span className="font-medium">{modeLabels[program.schedulingMode]}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Cadence</span>
                    <span className="font-medium">{cadenceLabels[program.cadence]}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Billing Model</span>
                    <span className="font-medium">
                      {program.billingModel ? billingLabels[program.billingModel] : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Late Joiner Policy</span>
                    <span className="font-medium">
                      {program.lateJoinerPolicy ? lateJoinerLabels[program.lateJoinerPolicy] : 'Not Set'}
                    </span>
                  </div>
                </div>
              )}
            </Card>
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
