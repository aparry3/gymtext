'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useEnvironment } from '@/context/EnvironmentContext'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelative } from '@/shared/utils/date'

interface OrganizationWithStats {
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

interface OrganizationStats {
  totalOrganizations: number
  activeOrganizations: number
  totalMembers: number
  totalPrograms: number
  totalBlogPosts: number
}

function OrganizationsPageContent() {
  const router = useRouter()
  const { mode } = useEnvironment()
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([])
  const [stats, setStats] = useState<OrganizationStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalMembers: 0,
    totalPrograms: 0,
    totalBlogPosts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/organizations')
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch organizations')
      }

      setOrganizations(result.data.organizations)
      setStats(result.data.stats)

    } catch (err) {
      setError('Failed to load organizations')
      console.error('Error fetching organizations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations, mode])

  const handleRefresh = useCallback(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  const handleCreateNew = useCallback(() => {
    // For now, navigate to a form page or open a modal
    // Using a simple prompt for MVP
    const name = window.prompt('Enter organization name:')
    if (!name) return

    fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          router.push(`/organizations/${result.data.id}`)
        } else {
          alert(result.message || 'Failed to create organization')
        }
      })
      .catch(err => {
        console.error('Error creating organization:', err)
        alert('Failed to create organization')
      })
  }, [router])

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <AdminHeader
          title="Organizations"
          subtitle={`${stats.totalOrganizations} total organizations`}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          actions={
            <Button onClick={handleCreateNew} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Organization
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatsCard
            title="Total Orgs"
            value={stats.totalOrganizations}
            icon={<BuildingIcon className="h-5 w-5" />}
            variant="primary"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active"
            value={stats.activeOrganizations}
            icon={<CheckIcon className="h-5 w-5" />}
            variant="success"
            isLoading={isLoading}
          />
          <StatsCard
            title="Members"
            value={stats.totalMembers}
            icon={<UsersIcon className="h-5 w-5" />}
            variant="info"
            isLoading={isLoading}
          />
          <StatsCard
            title="Programs"
            value={stats.totalPrograms}
            icon={<ClipboardIcon className="h-5 w-5" />}
            variant="warning"
            isLoading={isLoading}
          />
          <StatsCard
            title="Blog Posts"
            value={stats.totalBlogPosts}
            icon={<DocumentIcon className="h-5 w-5" />}
            variant="primary"
            isLoading={isLoading}
          />
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-destructive hover:underline"
              >
                Retry
              </button>
            </div>
          </Card>
        )}

        {/* Organizations List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <Card className="p-12 text-center">
            <BuildingIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first organization to start grouping program owners.
            </p>
            <Button onClick={handleCreateNew}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/organizations/${org.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BuildingIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold truncate">{org.name}</h3>
                      <Badge variant={org.isActive ? 'default' : 'secondary'}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {org.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {org.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {org.memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardIcon className="h-4 w-4" />
                        {org.programCount} programs
                      </span>
                      <span className="flex items-center gap-1">
                        <DocumentIcon className="h-4 w-4" />
                        {org.blogPostCount} posts
                      </span>
                      <span>/{org.slug}</span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-sm text-muted-foreground">
                    {formatRelative(org.createdAt)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  variant: 'primary' | 'success' | 'warning' | 'info'
  isLoading?: boolean
}

function StatsCard({ title, value, icon, variant, isLoading = false }: StatsCardProps) {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    info: 'bg-purple-50 text-purple-600 border-purple-100'
  }

  if (isLoading) {
    return (
      <Card className="p-6 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-8" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 hover:shadow-xl transition-shadow duration-200 border group">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-200 ${variantStyles[variant]} group-hover:scale-105`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}

// Icons
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
)

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export default function OrganizationsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <OrganizationsPageContent />
    </Suspense>
  )
}
