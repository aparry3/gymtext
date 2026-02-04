'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { OwnerType } from '@/components/admin/types'

type ImageInputMode = 'file' | 'url'

interface PendingUpload {
  file: File
  type: 'avatar' | 'wordmark'
}

export default function CreateProgramOwnerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    displayName: '',
    ownerType: 'coach' as OwnerType,
    bio: '',
    avatarUrl: '',
    wordmarkUrl: '',
    phone: '',
    isActive: true,
  })

  const [avatarMode, setAvatarMode] = useState<ImageInputMode>('file')
  const [wordmarkMode, setWordmarkMode] = useState<ImageInputMode>('file')
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [wordmarkPreview, setWordmarkPreview] = useState<string>('')
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const wordmarkInputRef = useRef<HTMLInputElement>(null)

  const ownerTypes: { value: OwnerType; label: string }[] = [
    { value: 'coach', label: 'Coach' },
    { value: 'trainer', label: 'Trainer' },
    { value: 'influencer', label: 'Influencer' },
    { value: 'admin', label: 'Admin' },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'wordmark') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('File must be an image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    if (type === 'avatar') {
      setAvatarPreview(previewUrl)
      setForm(prev => ({ ...prev, avatarUrl: '' }))
    } else {
      setWordmarkPreview(previewUrl)
      setForm(prev => ({ ...prev, wordmarkUrl: '' }))
    }

    // Add to pending uploads (replace if same type exists)
    setPendingUploads(prev => {
      const filtered = prev.filter(u => u.type !== type)
      return [...filtered, { file, type }]
    })

    setError(null)
  }

  const handleUrlChange = (url: string, type: 'avatar' | 'wordmark') => {
    if (type === 'avatar') {
      setForm(prev => ({ ...prev, avatarUrl: url }))
      setAvatarPreview(url)
      // Remove pending file upload for avatar
      setPendingUploads(prev => prev.filter(u => u.type !== 'avatar'))
    } else {
      setForm(prev => ({ ...prev, wordmarkUrl: url }))
      setWordmarkPreview(url)
      // Remove pending file upload for wordmark
      setPendingUploads(prev => prev.filter(u => u.type !== 'wordmark'))
    }
  }

  const uploadImage = async (ownerId: string, file: File, type: 'avatar' | 'wordmark'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch(`/api/program-owners/${ownerId}/image`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || `Failed to upload ${type}`)
    }

    return result.data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.displayName.trim()) {
      setError('Display name is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Format phone number to E.164
      const cleanedPhone = form.phone.replace(/\D/g, '');
      const formattedPhone = cleanedPhone.length === 10 ? `+1${cleanedPhone}` : null;

      // Create the owner first (without images if using file upload)
      const createResponse = await fetch('/api/program-owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          ownerType: form.ownerType,
          bio: form.bio.trim() || null,
          avatarUrl: avatarMode === 'url' ? (form.avatarUrl.trim() || null) : null,
          wordmarkUrl: wordmarkMode === 'url' ? (form.wordmarkUrl.trim() || null) : null,
          phone: formattedPhone,
          isActive: form.isActive,
        }),
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok || !createResult.success) {
        throw new Error(createResult.message || 'Failed to create program owner')
      }

      const ownerId = createResult.data.id

      // Upload pending files
      for (const upload of pendingUploads) {
        await uploadImage(ownerId, upload.file, upload.type)
      }

      // Redirect to the new owner's detail page
      router.push(`/program-owners/${ownerId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create program owner')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/program-owners')
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/program-owners">Program Owners</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Owner</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form Card */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Program Owner</h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Coach John Smith"
                disabled={isSubmitting}
              />
            </div>

            {/* Owner Type */}
            <div className="space-y-2">
              <label htmlFor="ownerType" className="text-sm font-medium">
                Owner Type <span className="text-destructive">*</span>
              </label>
              <select
                id="ownerType"
                value={form.ownerType}
                onChange={(e) => setForm(prev => ({ ...prev, ownerType: e.target.value as OwnerType }))}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ownerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Optional bio or description..."
                rows={3}
                disabled={isSubmitting}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={avatarMode === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAvatarMode('file')}
                    disabled={isSubmitting}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={avatarMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAvatarMode('url')}
                    disabled={isSubmitting}
                  >
                    Enter URL
                  </Button>
                </div>

                {avatarMode === 'file' ? (
                  <div className="flex items-center gap-3">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'avatar')}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      Choose File
                    </Button>
                    {avatarPreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="text-sm text-muted-foreground">Selected</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Input
                      value={form.avatarUrl}
                      onChange={(e) => handleUrlChange(e.target.value, 'avatar')}
                      placeholder="https://..."
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Wordmark */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Wordmark</label>
              <p className="text-xs text-muted-foreground">
                Logo displayed in the questionnaire header
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={wordmarkMode === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWordmarkMode('file')}
                    disabled={isSubmitting}
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={wordmarkMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWordmarkMode('url')}
                    disabled={isSubmitting}
                  >
                    Enter URL
                  </Button>
                </div>

                {wordmarkMode === 'file' ? (
                  <div className="flex items-center gap-3">
                    <input
                      ref={wordmarkInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'wordmark')}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => wordmarkInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      Choose File
                    </Button>
                    {wordmarkPreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={wordmarkPreview}
                          alt="Wordmark preview"
                          className="h-10 max-w-[120px] object-contain"
                        />
                        <span className="text-sm text-muted-foreground">Selected</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Input
                      value={form.wordmarkUrl}
                      onChange={(e) => handleUrlChange(e.target.value, 'wordmark')}
                      placeholder="https://..."
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    {wordmarkPreview && (
                      <img
                        src={wordmarkPreview}
                        alt="Wordmark preview"
                        className="h-10 max-w-[120px] object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
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
                  setForm(prev => ({ ...prev, phone: formatted }));
                }}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
                maxLength={14}
              />
              <p className="text-xs text-muted-foreground">
                Required for owner to access Programs Portal
              </p>
            </div>

            {/* Active Checkbox */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  disabled={isSubmitting}
                  className="rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Owner'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
