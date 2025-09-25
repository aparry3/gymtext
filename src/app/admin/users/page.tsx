'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { UsersFilters } from '@/components/admin/UsersFilters'
import { UsersTable } from '@/components/admin/UsersTable'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminUser, UserFilters, UserSort } from '@/types/admin'

// Mock data - replace with actual API calls later
const mockUsers: AdminUser[] = [
  {
    id: 'cus_Pa1Xyz123',
    name: 'Ava Johnson',
    email: 'ava@example.com',
    phoneNumber: '+13334567890',
    age: 32,
    gender: 'female',
    profile: null,
    stripeCustomerId: 'cus_Pa1Xyz123',
    preferredSendHour: 7,
    timezone: 'America/New_York',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date(),
    hasProfile: true,
  },
  {
    id: 'cus_Pb2Abc456',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phoneNumber: '+13336543210',
    age: 28,
    gender: 'male',
    profile: null,
    stripeCustomerId: 'cus_Pb2Abc456',
    preferredSendHour: 6,
    timezone: 'America/Los_Angeles',
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date(),
    hasProfile: true,
  },
  {
    id: 'cus_Pc3Def789',
    name: 'Sarah Williams',
    email: null,
    phoneNumber: '+13338901234',
    age: 26,
    gender: 'female',
    profile: null,
    stripeCustomerId: 'cus_Pc3Def789',
    preferredSendHour: 8,
    timezone: 'America/Chicago',
    createdAt: new Date('2024-06-10'),
    updatedAt: new Date(),
    hasProfile: false,
  },
  {
    id: 'cus_Pd4Ghi012',
    name: 'David Rodriguez',
    email: 'david.r@example.com',
    phoneNumber: '+13331098765',
    age: 35,
    gender: 'male',
    profile: null,
    stripeCustomerId: 'cus_Pd4Ghi012',
    preferredSendHour: 19,
    timezone: 'America/Denver',
    createdAt: new Date('2024-07-05'),
    updatedAt: new Date(),
    hasProfile: true,
  },
  {
    id: 'cus_Pe5Jkl345',
    name: 'Emily Thompson',
    email: 'emily.t@example.com',
    phoneNumber: '+13334321987',
    age: 29,
    gender: 'female',
    profile: null,
    stripeCustomerId: 'cus_Pe5Jkl345',
    preferredSendHour: 7,
    timezone: 'America/New_York',
    createdAt: new Date('2024-05-18'),
    updatedAt: new Date(),
    hasProfile: true,
  }
]

const mockStats = {
  totalUsers: 8,
  withEmail: 6,
  withProfile: 6,
  activeToday: 11
}

function AdminUsersPageContent() {
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState(mockStats)
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

  // Mock data fetcher - replace with actual API call
  const fetchUsers = useCallback(async (
    filters: UserFilters, 
    page: number, 
    sort: UserSort
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      let filteredUsers = [...mockUsers]

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredUsers = filteredUsers.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.id.toLowerCase().includes(searchLower)
        )
      }

      if (filters.hasEmail !== undefined) {
        filteredUsers = filteredUsers.filter(user =>
          filters.hasEmail ? user.email !== null : user.email === null
        )
      }

      if (filters.hasProfile !== undefined) {
        filteredUsers = filteredUsers.filter(user =>
          user.hasProfile === filters.hasProfile
        )
      }

      if (filters.gender) {
        filteredUsers = filteredUsers.filter(user =>
          user.gender === filters.gender
        )
      }

      // Apply sorting
      filteredUsers.sort((a, b) => {
        let aValue: string | number | Date
        let bValue: string | number | Date

        switch (sort.field) {
          case 'name':
            aValue = a.name || ''
            bValue = b.name || ''
            break
          case 'email':
            aValue = a.email || ''
            bValue = b.email || ''
            break
          case 'createdAt':
            aValue = a.createdAt
            bValue = b.createdAt
            break
          case 'age':
            aValue = a.age || 0
            bValue = b.age || 0
            break
          case 'timezone':
            aValue = a.timezone || ''
            bValue = b.timezone || ''
            break
          default:
            aValue = a.name || ''
            bValue = b.name || ''
        }

        if (sort.direction === 'desc') {
          return aValue < bValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })

      // Apply pagination
      const itemsPerPage = 10
      const total = filteredUsers.length
      const totalPages = Math.ceil(total / itemsPerPage)
      const startIndex = (page - 1) * itemsPerPage
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

      setUsers(paginatedUsers)
      setTotalPages(totalPages)
      setStats(mockStats) // In real app, this would come from API

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
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    info: 'bg-blue-100 text-blue-700'
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-8" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded ${variantStyles[variant]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
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