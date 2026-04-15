'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  FolderKanban,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminProgramOwner, AdminProgramOwnerDetailResponse, OwnerType } from '@/components/admin/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { formatRelative } from '@/shared/utils/date'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'

interface OwnerProgram {
  id: string
  name: string
  isActive: boolean
  enrollmentCount: number
  createdAt: Date | string
}

interface OwnerDetail extends AdminProgramOwner {
  programs: OwnerProgram[]
}

type ImageInputMode = 'file' | 'url'

interface ImageUploadState {
  mode: ImageInputMode
  isUploading: boolean
  previewUrl: string
}

const ownerTypeStyles: Record<OwnerType, string> = {
  coach: 'bg-blue-100 text-blue-800 border-blue-200',
  trainer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  influencer: 'bg-amber-100 text-amber-800 border-amber-200',
  admin: 'bg-violet-100 text-violet-800 border-violet-200',
}

function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '').replace(/^1/, '')
  if (cleaned.length !== 10) return phone

  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}

function formatAbsoluteDate(date: Date | string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function buildPublicOwnerUrl(slug: string | null): string | null {
  if (!slug) return null

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://gymtext.co'
  return `${baseUrl.replace(/\/$/, '')}/${slug}`
}

export default function ProgramOwnerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [owner, setOwner] = useState<OwnerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: '',
    slug: '',
    bio: '',
    avatarUrl: '',
    wordmarkUrl: '',
    phone: '',
    isActive: true,
    ownerType: 'coach' as OwnerType,
  })

  const [avatarUpload, setAvatarUpload] = useState<ImageUploadState>({
    mode: 'file',
    isUploading: false,
    previewUrl: '',
  })

  const [wordmarkUpload, setWordmarkUpload] = useState<ImageUploadState>({
    mode: 'file',
    isUploading: false,
    previewUrl: '',
  })

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const wordmarkInputRef = useRef<HTMLInputElement>(null)

  const fetchOwner = useCallback(async (ownerId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/program-owners/${ownerId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch program owner')
      }

      const data: AdminProgramOwnerDetailResponse = result.data
      setOwner({ ...data.owner, programs: data.programs })
      setEditForm({
        displayName: data.owner.displayName,
        slug: data.owner.slug || '',
        bio: data.owner.bio || '',
        avatarUrl: data.owner.avatarUrl || '',
        wordmarkUrl: data.owner.wordmarkUrl || '',
        phone: formatPhoneForDisplay(data.owner.phone),
        isActive: data.owner.isActive,
        ownerType: data.owner.ownerType,
      })
      setAvatarUpload(prev => ({
        ...prev,
        previewUrl: data.owner.avatarUrl || '',
      }))
      setWordmarkUpload(prev => ({
        ...prev,
        previewUrl: data.owner.wordmarkUrl || '',
      }))
    } catch (err) {
      setError('Failed to load program owner')
      console.error('Error fetching program owner:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchOwner(id as string)
    }
  }, [id, fetchOwner])

  const handleImageUpload = async (file: File, type: 'avatar' | 'wordmark') => {
    if (!owner) return

    const setUploadState = type === 'avatar' ? setAvatarUpload : setWordmarkUpload

    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploadState(prev => ({ ...prev, isUploading: true }))
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch(`/api/program-owners/${owner.id}/image`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload image')
      }

      const url = result.data.url
      setUploadState(prev => ({ ...prev, previewUrl: url }))

      if (type === 'avatar') {
        setEditForm(prev => ({ ...prev, avatarUrl: url }))
      } else {
        setEditForm(prev => ({ ...prev, wordmarkUrl: url }))
      }

      await fetchOwner(owner.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'wordmark') => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, type)
    }
  }

  const handleSave = async () => {
    if (!owner) return

    setIsSaving(true)
    setError(null)

    try {
      const cleanedPhone = editForm.phone.replace(/\D/g, '')
      const formattedPhone = cleanedPhone.length === 10 ? `+1${cleanedPhone}` : null

      const response = await fetch(`/api/program-owners/${owner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          phone: formattedPhone,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update program owner')
      }

      await fetchOwner(owner.id)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (owner) {
      setEditForm({
        displayName: owner.displayName,
        slug: owner.slug || '',
        bio: owner.bio || '',
        avatarUrl: owner.avatarUrl || '',
        wordmarkUrl: owner.wordmarkUrl || '',
        phone: formatPhoneForDisplay(owner.phone),
        isActive: owner.isActive,
        ownerType: owner.ownerType,
      })
      setAvatarUpload(prev => ({
        ...prev,
        previewUrl: owner.avatarUrl || '',
      }))
      setWordmarkUpload(prev => ({
        ...prev,
        previewUrl: owner.wordmarkUrl || '',
      }))
    }

    setIsEditing(false)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error && !owner) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <Card className="border-destructive/20 bg-destructive/5 p-6">
            <div className="space-y-4 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={() => router.push('/program-owners')}>
                Back to Program Owners
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!owner) return null

  const initials = owner.displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const publicOwnerUrl = buildPublicOwnerUrl(owner.slug)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_40%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/program-owners">Program Owners</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{owner.displayName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Button
                variant="ghost"
                onClick={() => router.push('/program-owners')}
                className="w-fit gap-2 px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Program Owners
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {publicOwnerUrl && !isEditing && (
                <a
                  href={publicOwnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  View Public Page
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
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
                  Edit Owner
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Card className="border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}

          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <Avatar className="h-24 w-24 border-4 border-white/10 shadow-lg">
                    {owner.avatarUrl ? (
                      <AvatarImage src={owner.avatarUrl} alt={owner.displayName} />
                    ) : null}
                    <AvatarFallback className="bg-white/10 text-2xl text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-semibold tracking-tight">{owner.displayName}</h1>
                        <Badge className={cn('border', ownerTypeStyles[owner.ownerType])}>
                          {owner.ownerType}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'border text-xs',
                            owner.isActive
                              ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100'
                              : 'border-white/15 bg-white/10 text-slate-200'
                          )}
                        >
                          {owner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {owner.bio ? (
                        <p className="max-w-2xl text-sm leading-6 text-slate-300">{owner.bio}</p>
                      ) : (
                        <p className="text-sm text-slate-400">No bio added yet.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                        <CalendarDays className="h-4 w-4" />
                        Joined {formatAbsoluteDate(owner.createdAt)}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        {owner.userId ? 'Linked to a user account' : 'No linked user account'}
                      </div>
                    </div>
                  </div>
                </div>

                {owner.wordmarkUrl && !isEditing && (
                  <div className="rounded-2xl border border-white/10 bg-white px-4 py-3 shadow-lg">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Wordmark
                    </div>
                    <img
                      src={owner.wordmarkUrl}
                      alt={`${owner.displayName} wordmark`}
                      className="h-10 max-w-[180px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 bg-white p-6 md:grid-cols-3">
              <StatCard
                icon={<FolderKanban className="h-5 w-5" />}
                label="Programs"
                value={String(owner.programCount)}
                tone="blue"
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Active enrollments"
                value={String(owner.enrollmentCount)}
                tone="emerald"
              />
              <StatCard
                icon={<CalendarDays className="h-5 w-5" />}
                label="Last updated"
                value={formatRelative(owner.updatedAt)}
                tone="slate"
              />
            </div>
          </Card>

          {isEditing ? (
            <Card className="border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Edit Owner</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update the public profile, portal settings, and admin metadata for this owner.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <FormField label="Display Name">
                    <Input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  </FormField>

                  <FormField label="Slug" helpText="URL-friendly identifier for public pages.">
                    <Input
                      value={editForm.slug}
                      onChange={(e) => {
                        const formatted = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '')

                        setEditForm(prev => ({ ...prev, slug: formatted }))
                      }}
                      placeholder="e.g. pat-clatchey"
                    />
                  </FormField>

                  <FormField label="Type">
                    <select
                      value={editForm.ownerType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ownerType: e.target.value as OwnerType }))}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="coach">Coach</option>
                      <option value="trainer">Trainer</option>
                      <option value="influencer">Influencer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </FormField>

                  <FormField label="Phone Number" helpText="Required for Programs Portal access.">
                    <Input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '')
                        let formatted = cleaned

                        if (cleaned.length <= 3) {
                          formatted = cleaned
                        } else if (cleaned.length <= 6) {
                          formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
                        } else {
                          formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
                        }

                        setEditForm(prev => ({ ...prev, phone: formatted }))
                      }}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                    />
                  </FormField>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Owner Status</p>
                        <p className="text-sm text-slate-500">
                          Inactive owners remain visible in admin but can be treated as disabled elsewhere.
                        </p>
                      </div>
                      <Switch
                        checked={editForm.isActive}
                        onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <FormField label="Bio">
                    <textarea
                      value={editForm.bio}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      rows={5}
                    />
                  </FormField>

                  <ImageEditor
                    label="Avatar"
                    uploadState={avatarUpload}
                    value={editForm.avatarUrl}
                    inputRef={avatarInputRef}
                    onModeChange={(mode) => setAvatarUpload(prev => ({ ...prev, mode }))}
                    onSelectFile={() => avatarInputRef.current?.click()}
                    onFileChange={(e) => handleFileSelect(e, 'avatar')}
                    onUrlChange={(value) => {
                      setEditForm(prev => ({ ...prev, avatarUrl: value }))
                      setAvatarUpload(prev => ({ ...prev, previewUrl: value }))
                    }}
                    previewClassName="h-12 w-12 rounded-full object-cover"
                  />

                  <ImageEditor
                    label="Wordmark"
                    helpText="Logo displayed in the questionnaire header."
                    uploadState={wordmarkUpload}
                    value={editForm.wordmarkUrl}
                    inputRef={wordmarkInputRef}
                    onModeChange={(mode) => setWordmarkUpload(prev => ({ ...prev, mode }))}
                    onSelectFile={() => wordmarkInputRef.current?.click()}
                    onFileChange={(e) => handleFileSelect(e, 'wordmark')}
                    onUrlChange={(value) => {
                      setEditForm(prev => ({ ...prev, wordmarkUrl: value }))
                      setWordmarkUpload(prev => ({ ...prev, previewUrl: value }))
                    }}
                    previewClassName="h-10 max-w-[140px] object-contain"
                  />
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card className="border-slate-200 p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">Owner Details</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Key profile and portal information for this program owner.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Phone"
                    value={owner.phone ? formatPhoneForDisplay(owner.phone) : 'No phone added'}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Slug"
                    value={owner.slug || 'No public slug'}
                    icon={<ExternalLink className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Created"
                    value={formatAbsoluteDate(owner.createdAt)}
                    icon={<CalendarDays className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Updated"
                    value={formatRelative(owner.updatedAt)}
                    icon={<CalendarDays className="h-4 w-4" />}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Public profile
                    </div>
                    {publicOwnerUrl ? (
                      <a
                        href={publicOwnerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        {publicOwnerUrl.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        No public profile URL is configured because this owner does not have a slug yet.
                      </p>
                    )}
                  </div>

                  {owner.wordmarkUrl && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Brand wordmark
                      </div>
                      <img
                        src={owner.wordmarkUrl}
                        alt={`${owner.displayName} wordmark`}
                        className="mt-3 h-10 max-w-[180px] object-contain"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-slate-200 p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Programs</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Every program below links directly to its admin detail page.
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                    {owner.programs.length} total
                  </Badge>
                </div>

                {owner.programs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
                    <p className="text-sm text-slate-500">No programs yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {owner.programs.map((program) => (
                      <Link
                        key={program.id}
                        href={`/programs/${program.id}`}
                        className="group block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-base font-semibold text-slate-900">
                                {program.name}
                              </div>
                              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              Created {formatAbsoluteDate(program.createdAt)}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant={program.isActive ? 'default' : 'secondary'}>
                              {program.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="rounded-xl bg-slate-100 px-3 py-2 text-right">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Enrollments
                              </div>
                              <div className="text-sm font-semibold text-slate-900">
                                {program.enrollmentCount}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'blue' | 'emerald' | 'slate'
}

function StatCard({ icon, label, value, tone }: StatCardProps) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-start gap-4">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border', toneClasses[tone])}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  )
}

interface DetailItemProps {
  label: string
  value: string
  icon: React.ReactNode
}

function DetailItem({ label, value, icon }: DetailItemProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  helpText?: string
  children: React.ReactNode
}

function FormField({ label, helpText, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {helpText ? <p className="mt-1 text-xs text-slate-500">{helpText}</p> : null}
      </div>
      {children}
    </div>
  )
}

interface ImageEditorProps {
  label: string
  helpText?: string
  uploadState: ImageUploadState
  value: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onModeChange: (mode: ImageInputMode) => void
  onSelectFile: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUrlChange: (value: string) => void
  previewClassName: string
}

function ImageEditor({
  label,
  helpText,
  uploadState,
  value,
  inputRef,
  onModeChange,
  onSelectFile,
  onFileChange,
  onUrlChange,
  previewClassName,
}: ImageEditorProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {helpText ? <p className="mt-1 text-xs text-slate-500">{helpText}</p> : null}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadState.mode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('file')}
        >
          Upload File
        </Button>
        <Button
          type="button"
          variant={uploadState.mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('url')}
        >
          Enter URL
        </Button>
      </div>

      {uploadState.mode === 'file' ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onSelectFile}
            disabled={uploadState.isUploading}
          >
            {uploadState.isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
          {uploadState.previewUrl ? (
            <img
              src={uploadState.previewUrl}
              alt={`${label} preview`}
              className={previewClassName}
            />
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={value}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          {uploadState.previewUrl ? (
            <img
              src={uploadState.previewUrl}
              alt={`${label} preview`}
              className={previewClassName}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-44" />
          </div>

          <Card className="overflow-hidden border-slate-200">
            <div className="px-6 py-8">
              <div className="flex flex-col gap-6 sm:flex-row">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-full max-w-2xl" />
                  <Skeleton className="h-4 w-80" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 border-t p-6 md:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="p-6">
              <Skeleton className="h-6 w-36" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </Card>

            <Card className="p-6">
              <Skeleton className="h-6 w-28" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
