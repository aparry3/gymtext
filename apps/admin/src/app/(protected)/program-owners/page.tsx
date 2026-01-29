'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProgramOwnersFilters } from '@/components/admin/ProgramOwnersFilters'
import { ProgramOwnersTable } from '@/components/admin/ProgramOwnersTable'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  AdminProgramOwner,
  ProgramOwnerFilters,
  ProgramOwnerSort,
  ProgramOwnerStats
} from '@/components/admin/types'

function ProgramOwnersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [owners, setOwners] = useState<AdminProgramOwner[]>([])
  const [stats, setStats] = useState<ProgramOwnerStats>({
    totalOwners: 0,
    byType: { ai: 0, coach: 0, trainer: 0, influencer: 0, brand: 0 },
    activeOwners: 0,
    totalPrograms: 0,
    totalEnrollments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState<ProgramOwnerSort>({ field: 'createdAt', direction: 'desc' })

  // Parse initial filters from search params
  const initialFilters: ProgramOwnerFilters = {
    search: searchParams?.get('search') || undefined,
    ownerType: (searchParams?.get('ownerType') as ProgramOwnerFilters['ownerType']) || undefined,
    isActive: searchParams?.get('isActive') === 'true' ? true :
              searchParams?.get('isActive') === 'false' ? false : undefined,
  }

  const [filters, setFilters] = useState<ProgramOwnerFilters>(initialFilters)

  // API data fetcher
  const fetchOwners = useCallback(async (
    filters: ProgramOwnerFilters,
    page: number,
    sort: ProgramOwnerSort
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()

      if (filters.search) params.set('search', filters.search)
      if (filters.ownerType) params.set('ownerType', filters.ownerType)
      if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

      params.set('page', String(page))
      params.set('pageSize', '20')
      params.set('sortField', sort.field)
      params.set('sortDirection', sort.direction)

      const response = await fetch(`/api/program-owners?${params.toString()}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch program owners')
      }

      const { owners: fetchedOwners, pagination, stats: fetchedStats } = result.data

      setOwners(fetchedOwners)
      setTotalPages(pagination.totalPages)
      setStats(fetchedStats)

    } catch (err) {
      setError('Failed to load program owners')
      console.error('Error fetching program owners:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch data when filters, page, or sort changes
  useEffect(() => {
    fetchOwners(filters, currentPage, sort)
  }, [fetchOwners, filters, currentPage, sort])

  const handleFiltersChange = useCallback((newFilters: ProgramOwnerFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handleSortChange = useCallback((newSort: ProgramOwnerSort) => {
    setSort(newSort)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchOwners(filters, currentPage, sort)
  }, [fetchOwners, filters, currentPage, sort])

  const handleCreateNew = useCallback(() => {
    router.push('/program-owners/new')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <AdminHeader
          title="Program Owners"
          subtitle={`${stats.totalOwners} total owners`}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          actions={
            <Button onClick={handleCreateNew} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Owner
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatsCard
            title="Total Owners"
            value={stats.totalOwners}
            icon={<BuildingIcon className="h-5 w-5" />}
            variant="primary"
            isLoading={isLoading}
          />
          <StatsCard
            title="AI"
            value={stats.byType.ai}
            icon={<BotIcon className="h-5 w-5" />}
            variant="info"
            isLoading={isLoading}
          />
          <StatsCard
            title="Coaches"
            value={stats.byType.coach}
            icon={<UserIcon className="h-5 w-5" />}
            variant="success"
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
            title="Enrollments"
            value={stats.totalEnrollments}
            icon={<UsersIcon className="h-5 w-5" />}
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

        {/* Filters */}
        <ProgramOwnersFilters
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Owners Table */}
        <ProgramOwnersTable
          owners={owners}
          isLoading={isLoading}
          sort={sort}
          onSortChange={handleSortChange}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={stats.totalOwners}
            itemsPerPage={20}
          />
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

// Simple icons
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const BotIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export default function ProgramOwnersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <ProgramOwnersPageContent />
    </Suspense>
  )
}
