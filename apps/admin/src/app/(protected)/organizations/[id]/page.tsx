'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
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

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  wordmarkUrl: string | null
  websiteUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  memberCount: number
  programCount: number
  blogPostCount: number
}

interface OrganizationMember {
  id: string
  organizationId: string
  programOwnerId: string
  role: 'admin' | 'editor' | 'viewer'
  joinedAt: Date
  owner: {
    id: string
    displayName: string
    avatarUrl: string | null
    ownerType: string
  }
}

interface ProgramOwner {
  id: string
  displayName: string
  avatarUrl: string | null
  ownerType: string
}

export default function OrganizationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { mode } = useEnvironment()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [availableOwners, setAvailableOwners] = useState<ProgramOwner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    wordmarkUrl: '',
    websiteUrl: '',
    isActive: true,
  })

  // Add member state
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [isAddingMember, setIsAddingMember] = useState(false)

  // Fetch organization data
  const fetchOrganization = useCallback(async (orgId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/${orgId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch organization')
      }

      const data = result.data
      setOrganization(data.organization)
      setMembers(data.members)
      setEditForm({
        name: data.organization.name,
        slug: data.organization.slug,
        description: data.organization.description || '',
        logoUrl: data.organization.logoUrl || '',
        wordmarkUrl: data.organization.wordmarkUrl || '',
        websiteUrl: data.organization.websiteUrl || '',
        isActive: data.organization.isActive,
      })
    } catch (err) {
      setError('Failed to load organization')
      console.error('Error fetching organization:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch available program owners for adding members
  const fetchAvailableOwners = useCallback(async () => {
    try {
      const response = await fetch('/api/program-owners?pageSize=100')
      const result = await response.json()

      if (result.success) {
        setAvailableOwners(result.data.owners)
      }
    } catch (err) {
      console.error('Error fetching program owners:', err)
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchOrganization(id as string)
      fetchAvailableOwners()
    }
  }, [id, fetchOrganization, fetchAvailableOwners, mode])

  const handleSave = async () => {
    if (!organization) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update organization')
      }

      await fetchOrganization(organization.id)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (organization) {
      setEditForm({
        name: organization.name,
        slug: organization.slug,
        description: organization.description || '',
        logoUrl: organization.logoUrl || '',
        wordmarkUrl: organization.wordmarkUrl || '',
        websiteUrl: organization.websiteUrl || '',
        isActive: organization.isActive,
      })
    }
    setIsEditing(false)
  }

  const handleAddMember = async () => {
    if (!organization || !selectedOwnerId) return

    setIsAddingMember(true)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/${organization.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programOwnerId: selectedOwnerId,
          role: selectedRole,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add member')
      }

      await fetchOrganization(organization.id)
      setShowAddMember(false)
      setSelectedOwnerId('')
      setSelectedRole('editor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleUpdateRole = async (memberId: string, programOwnerId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    if (!organization) return

    try {
      const response = await fetch(`/api/organizations/${organization.id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programOwnerId,
          role: newRole,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update role')
      }

      await fetchOrganization(organization.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const handleRemoveMember = async (programOwnerId: string) => {
    if (!organization) return
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/members?programOwnerId=${programOwnerId}`,
        { method: 'DELETE' }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to remove member')
      }

      await fetchOrganization(organization.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error && !organization) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-destructive/20 bg-destructive/5 p-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={() => router.push('/organizations')}>
              Back to Organizations
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!organization) return null

  // Filter out owners who are already members
  const memberOwnerIds = new Set(members.map(m => m.programOwnerId))
  const nonMemberOwners = availableOwners.filter(o => !memberOwnerIds.has(o.id))

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    editor: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/organizations">Organizations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{organization.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Organization Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="h-24 w-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BuildingIcon className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Slug</label>
                    <Input
                      value={editForm.slug}
                      onChange={(e) => setEditForm(prev => ({ ...prev, slug: e.target.value }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL-friendly identifier
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Logo URL</label>
                    <Input
                      value={editForm.logoUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="mt-1"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Wordmark URL</label>
                    <Input
                      value={editForm.wordmarkUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, wordmarkUrl: e.target.value }))}
                      className="mt-1"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Website URL</label>
                    <Input
                      value={editForm.websiteUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      className="mt-1"
                      placeholder="https://..."
                    />
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
                    <h1 className="text-2xl font-bold">{organization.name}</h1>
                    <Badge variant={organization.isActive ? 'default' : 'secondary'}>
                      {organization.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">/{organization.slug}</p>
                  {organization.description && (
                    <p className="text-muted-foreground">{organization.description}</p>
                  )}
                  {organization.websiteUrl && (
                    <a
                      href={organization.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {organization.websiteUrl}
                    </a>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Created {formatRelative(organization.createdAt)}
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
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{organization.memberCount}</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{organization.programCount}</div>
            <div className="text-sm text-muted-foreground">Programs</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{organization.blogPostCount}</div>
            <div className="text-sm text-muted-foreground">Blog Posts</div>
          </Card>
        </div>

        {/* Members */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Members</h2>
            <Button
              size="sm"
              onClick={() => setShowAddMember(!showAddMember)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <Card className="p-4 mb-4 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Program Owner
                  </label>
                  <select
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a program owner</option>
                    {nonMemberOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.displayName} ({owner.ownerType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedOwnerId || isAddingMember}
                  >
                    {isAddingMember ? 'Adding...' : 'Add'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddMember(false)
                      setSelectedOwnerId('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Members List */}
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No members yet</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {member.owner.avatarUrl ? (
                        <AvatarImage src={member.owner.avatarUrl} alt={member.owner.displayName} />
                      ) : null}
                      <AvatarFallback>
                        {member.owner.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.owner.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.owner.ownerType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, member.programOwnerId, e.target.value as 'admin' | 'editor' | 'viewer')}
                      className={`flex h-8 w-24 rounded-md border-0 px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${roleColors[member.role]}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMember(member.programOwnerId)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
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
            <Skeleton className="h-24 w-24 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <Skeleton className="h-12 w-full" />
          </Card>
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

// Icons
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
)
