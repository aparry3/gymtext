'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
import { AdminProgramOwner, AdminProgramOwnerDetailResponse, OwnerType } from '@/components/admin/types'
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

interface OwnerDetail extends AdminProgramOwner {
  programs: {
    id: string
    name: string
    isActive: boolean
    enrollmentCount: number
    createdAt: Date
  }[]
}

type ImageInputMode = 'file' | 'url'

interface ImageUploadState {
  mode: ImageInputMode
  isUploading: boolean
  previewUrl: string
}

export default function ProgramOwnerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { mode } = useEnvironment()
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

  // Fetch owner data
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
      // Format phone for display
      const phone = data.owner.phone || '';
      const cleaned = phone.replace(/\D/g, '').replace(/^1/, '');
      let formattedPhone = '';
      if (cleaned.length === 10) {
        formattedPhone = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
      setEditForm({
        displayName: data.owner.displayName,
        slug: data.owner.slug || '',
        bio: data.owner.bio || '',
        avatarUrl: data.owner.avatarUrl || '',
        wordmarkUrl: data.owner.wordmarkUrl || '',
        phone: formattedPhone,
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
  }, [id, fetchOwner, mode])

  const handleImageUpload = async (file: File, type: 'avatar' | 'wordmark') => {
    if (!owner) return

    const setUploadState = type === 'avatar' ? setAvatarUpload : setWordmarkUpload

    // Validate file
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

      // Update preview and form
      const url = result.data.url
      setUploadState(prev => ({ ...prev, previewUrl: url }))

      if (type === 'avatar') {
        setEditForm(prev => ({ ...prev, avatarUrl: url }))
      } else {
        setEditForm(prev => ({ ...prev, wordmarkUrl: url }))
      }

      // Refresh owner data
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
      // Format phone number to E.164
      const cleanedPhone = editForm.phone.replace(/\D/g, '');
      const formattedPhone = cleanedPhone.length === 10 ? `+1${cleanedPhone}` : null;

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

      // Refresh data
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
      // Format phone for display
      const phone = owner.phone || '';
      const cleaned = phone.replace(/\D/g, '').replace(/^1/, '');
      let formattedPhone = '';
      if (cleaned.length === 10) {
        formattedPhone = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
      setEditForm({
        displayName: owner.displayName,
        slug: owner.slug || '',
        bio: owner.bio || '',
        avatarUrl: owner.avatarUrl || '',
        wordmarkUrl: owner.wordmarkUrl || '',
        phone: formattedPhone,
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => router.push('/program-owners')}>
              Back to Program Owners
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!owner) return null

  const initials = owner.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const typeColors: Record<string, string> = {
    ai: 'bg-purple-100 text-purple-800',
    coach: 'bg-blue-100 text-blue-800',
    trainer: 'bg-green-100 text-green-800',
    influencer: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
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

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Owner Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              {owner.avatarUrl ? (
                <AvatarImage src={owner.avatarUrl} alt={owner.displayName} />
              ) : null}
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Display Name</label>
                    <Input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Slug</label>
                    <Input
                      value={editForm.slug}
                      onChange={(e) => {
                        // Auto-format: lowercase, replace spaces with hyphens, allow only alphanumeric + hyphens
                        const formatted = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '');
                        setEditForm(prev => ({ ...prev, slug: formatted }));
                      }}
                      placeholder="e.g., pat-clatchey"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL-friendly identifier for public pages (e.g., pat-clatchey)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={editForm.ownerType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ownerType: e.target.value as OwnerType }))}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="coach">Coach</option>
                      <option value="trainer">Trainer</option>
                      <option value="influencer">Influencer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Avatar</label>
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={avatarUpload.mode === 'file' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarUpload(prev => ({ ...prev, mode: 'file' }))}
                        >
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={avatarUpload.mode === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarUpload(prev => ({ ...prev, mode: 'url' }))}
                        >
                          Enter URL
                        </Button>
                      </div>

                      {avatarUpload.mode === 'file' ? (
                        <div className="flex items-center gap-3">
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'avatar')}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={avatarUpload.isUploading}
                          >
                            {avatarUpload.isUploading ? 'Uploading...' : 'Choose File'}
                          </Button>
                          {avatarUpload.previewUrl && (
                            <div className="flex items-center gap-2">
                              <img
                                src={avatarUpload.previewUrl}
                                alt="Avatar preview"
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <span className="text-sm text-muted-foreground">Current avatar</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Input
                            value={editForm.avatarUrl}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, avatarUrl: e.target.value }))
                              setAvatarUpload(prev => ({ ...prev, previewUrl: e.target.value }))
                            }}
                            placeholder="https://..."
                            className="flex-1"
                          />
                          {avatarUpload.previewUrl && (
                            <img
                              src={avatarUpload.previewUrl}
                              alt="Avatar preview"
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Wordmark Upload */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Wordmark</label>
                    <p className="text-xs text-muted-foreground mb-1">
                      Logo displayed in the questionnaire header
                    </p>
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={wordmarkUpload.mode === 'file' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setWordmarkUpload(prev => ({ ...prev, mode: 'file' }))}
                        >
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={wordmarkUpload.mode === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setWordmarkUpload(prev => ({ ...prev, mode: 'url' }))}
                        >
                          Enter URL
                        </Button>
                      </div>

                      {wordmarkUpload.mode === 'file' ? (
                        <div className="flex items-center gap-3">
                          <input
                            ref={wordmarkInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'wordmark')}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => wordmarkInputRef.current?.click()}
                            disabled={wordmarkUpload.isUploading}
                          >
                            {wordmarkUpload.isUploading ? 'Uploading...' : 'Choose File'}
                          </Button>
                          {wordmarkUpload.previewUrl && (
                            <div className="flex items-center gap-2">
                              <img
                                src={wordmarkUpload.previewUrl}
                                alt="Wordmark preview"
                                className="h-10 max-w-[120px] object-contain"
                              />
                              <span className="text-sm text-muted-foreground">Current wordmark</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Input
                            value={editForm.wordmarkUrl}
                            onChange={(e) => {
                              setEditForm(prev => ({ ...prev, wordmarkUrl: e.target.value }))
                              setWordmarkUpload(prev => ({ ...prev, previewUrl: e.target.value }))
                            }}
                            placeholder="https://..."
                            className="flex-1"
                          />
                          {wordmarkUpload.previewUrl && (
                            <img
                              src={wordmarkUpload.previewUrl}
                              alt="Wordmark preview"
                              className="h-10 max-w-[120px] object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <Input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        let formatted = cleaned;
                        if (cleaned.length <= 3) {
                          formatted = cleaned;
                        } else if (cleaned.length <= 6) {
                          formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
                        } else {
                          formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
                        }
                        setEditForm(prev => ({ ...prev, phone: formatted }));
                      }}
                      className="mt-1"
                      placeholder="(555) 123-4567"
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for Programs Portal access
                    </p>
                  </div>
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
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{owner.displayName}</h1>
                    <Badge className={`${typeColors[owner.ownerType]} border-0`}>
                      {owner.ownerType}
                    </Badge>
                    <Badge variant={owner.isActive ? 'default' : 'secondary'}>
                      {owner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {owner.bio && (
                    <p className="text-muted-foreground">{owner.bio}</p>
                  )}
                  {owner.wordmarkUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Wordmark:</span>
                      <img
                        src={owner.wordmarkUrl}
                        alt="Wordmark"
                        className="h-8 max-w-[120px] object-contain"
                      />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Created {formatRelative(owner.createdAt)}
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
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{owner.programCount}</div>
            <div className="text-sm text-muted-foreground">Programs</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{owner.enrollmentCount}</div>
            <div className="text-sm text-muted-foreground">Active Enrollments</div>
          </Card>
        </div>

        {/* Programs List */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Programs</h2>
          {owner.programs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No programs yet</p>
          ) : (
            <div className="space-y-3">
              {owner.programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium">{program.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {program.enrollmentCount} enrollments
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={program.isActive ? 'default' : 'secondary'}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatRelative(program.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
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
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
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
