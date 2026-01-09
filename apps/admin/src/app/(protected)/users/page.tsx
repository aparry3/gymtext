'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { UsersFilters } from '@/components/admin/UsersFilters'
import { UsersTable } from '@/components/admin/UsersTable'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminUser, UserFilters, UserSort } from '@/components/admin/types'


function AdminUsersPageContent() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    withEmail: 0,
    withProfile: 0,
    activeToday: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState<UserSort>({ field: 'createdAt', direction: 'desc' })

  // Parse initial filters from search params
  const initialFilters: UserFilters = {
    search: searchParams?.get('search') || undefined,
    hasEmail: searchParams?.get('hasEmail') === 'true' || undefined,
    hasProfile: searchParams?.get('hasProfile') === 'true' || undefined,
    gender: searchParams?.get('gender') || undefined,
  }

  const [filters, setFilters] = useState<UserFilters>(initialFilters)

  // API data fetcher
  const fetchUsers = useCallback(async (
    filters: UserFilters, 
    page: number, 
    sort: UserSort
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      if (filters.search) params.set('search', filters.search)
      if (filters.hasEmail !== undefined) params.set('hasEmail', String(filters.hasEmail))
      if (filters.hasProfile !== undefined) params.set('hasProfile', String(filters.hasProfile))
      if (filters.gender) params.set('gender', filters.gender)
      
      params.set('page', String(page))
      params.set('pageSize', '10')
      params.set('sortField', sort.field)
      params.set('sortDirection', sort.direction)

      const response = await fetch(`/api/users?${params.toString()}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch users')
      }

      const { users: fetchedUsers, pagination, stats: fetchedStats } = result.data

      setUsers(fetchedUsers)
      setTotalPages(pagination.totalPages)
      setStats(fetchedStats)

    } catch (err) {
      setError('Failed to load users')
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch data when filters, page, or sort changes
  useEffect(() => {
    fetchUsers(filters, currentPage, sort)
  }, [fetchUsers, filters, currentPage, sort])

  const handleFiltersChange = useCallback((newFilters: UserFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handleSortChange = useCallback((newSort: UserSort) => {
    setSort(newSort)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchUsers(filters, currentPage, sort)
  }, [fetchUsers, filters, currentPage, sort])

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <AdminHeader
          title="Users"
          subtitle={`${stats.totalUsers} total users`}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<UsersIcon className="h-5 w-5" />}
            variant="primary"
            isLoading={isLoading}
          />
          <StatsCard
            title="With Email"
            value={stats.withEmail}
            icon={<MailIcon className="h-5 w-5" />}
            variant="success"
            isLoading={isLoading}
          />
          <StatsCard
            title="With Profile"
            value={stats.withProfile}
            icon={<UserIcon className="h-5 w-5" />}
            variant="warning"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active Today"
            value={stats.activeToday}
            icon={<ActivityIcon className="h-5 w-5" />}
            variant="info"
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
        <UsersFilters
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Users Table */}
        <UsersTable
          users={users}
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
            totalItems={stats.totalUsers}
            itemsPerPage={10}
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
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

const MailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
  </svg>
)

export default function AdminUsersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <AdminUsersPageContent />
    </Suspense>
  )
}