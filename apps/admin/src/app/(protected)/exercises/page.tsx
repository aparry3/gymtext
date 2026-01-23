'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ExercisesFilters } from '@/components/admin/ExercisesFilters'
import { ExercisesTable } from '@/components/admin/ExercisesTable'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  AdminExercise,
  ExerciseFilters,
  ExerciseSort,
  ExerciseStats
} from '@/components/admin/types'

function ExercisesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [exercises, setExercises] = useState<AdminExercise[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [stats, setStats] = useState<ExerciseStats>({
    total: 0,
    byCategory: {},
    byLevel: {},
    active: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sort, setSort] = useState<ExerciseSort>({ field: 'name', direction: 'asc' })

  // Parse initial filters from search params
  const initialFilters: ExerciseFilters = {
    search: searchParams?.get('search') || undefined,
    category: searchParams?.get('category') || undefined,
    level: searchParams?.get('level') || undefined,
    equipment: searchParams?.get('equipment') || undefined,
    muscle: searchParams?.get('muscle') || undefined,
    isActive: searchParams?.get('isActive') === 'true' ? true :
              searchParams?.get('isActive') === 'false' ? false : undefined,
  }

  const [filters, setFilters] = useState<ExerciseFilters>(initialFilters)

  // API data fetcher
  const fetchExercises = useCallback(async (
    filters: ExerciseFilters,
    page: number,
    sort: ExerciseSort
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()

      if (filters.search) params.set('search', filters.search)
      if (filters.category) params.set('category', filters.category)
      if (filters.level) params.set('level', filters.level)
      if (filters.equipment) params.set('equipment', filters.equipment)
      if (filters.muscle) params.set('muscle', filters.muscle)
      if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

      params.set('page', String(page))
      params.set('pageSize', '20')
      params.set('sortField', sort.field)
      params.set('sortDirection', sort.direction)

      const response = await fetch(`/api/exercises?${params.toString()}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch exercises')
      }

      const { exercises: fetchedExercises, pagination, stats: fetchedStats } = result.data

      setExercises(fetchedExercises)
      setTotalPages(pagination.totalPages)
      setStats(fetchedStats)

      // Extract unique categories and equipment for filters
      const uniqueCategories = Object.keys(fetchedStats.byCategory).sort()
      setCategories(uniqueCategories)

      // Get equipment from first page
      const equipmentSet = new Set<string>()
      fetchedExercises.forEach((e: AdminExercise) => {
        if (e.equipment) equipmentSet.add(e.equipment)
      })
      setEquipment(Array.from(equipmentSet).sort())

    } catch (err) {
      setError('Failed to load exercises')
      console.error('Error fetching exercises:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch data when filters, page, or sort changes
  useEffect(() => {
    fetchExercises(filters, currentPage, sort)
  }, [fetchExercises, filters, currentPage, sort])

  const handleFiltersChange = useCallback((newFilters: ExerciseFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const handleSortChange = useCallback((newSort: ExerciseSort) => {
    setSort(newSort)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleRefresh = useCallback(() => {
    fetchExercises(filters, currentPage, sort)
  }, [fetchExercises, filters, currentPage, sort])

  const handleCreateNew = useCallback(() => {
    router.push('/exercises/new')
  }, [router])

  // Get top categories for stats display
  const topCategories = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <AdminHeader
          title="Exercises"
          subtitle={`${stats.total} total exercises`}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          actions={
            <Button onClick={handleCreateNew} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Exercise
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatsCard
            title="Total Exercises"
            value={stats.total}
            icon={<DumbbellIcon className="h-5 w-5" />}
            variant="primary"
            isLoading={isLoading}
          />
          <StatsCard
            title="Active"
            value={stats.active}
            icon={<CheckIcon className="h-5 w-5" />}
            variant="success"
            isLoading={isLoading}
          />
          {topCategories.map(([category, count], index) => (
            <StatsCard
              key={category}
              title={formatLabel(category)}
              value={count}
              icon={<TagIcon className="h-5 w-5" />}
              variant={['info', 'warning', 'primary'][index] as 'info' | 'warning' | 'primary'}
              isLoading={isLoading}
            />
          ))}
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
        <ExercisesFilters
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
          categories={categories}
          equipment={equipment}
        />

        {/* Exercises Table */}
        <ExercisesTable
          exercises={exercises}
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
            totalItems={stats.total}
            itemsPerPage={20}
          />
        )}
      </div>
    </div>
  )
}

function formatLabel(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
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
const DumbbellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.25h10.5a2.25 2.25 0 0 1 2.25 2.25v15a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5v-15a2.25 2.25 0 0 1 2.25-2.25Z M8.25 6h7.5M8.25 10h7.5M8.25 14h7.5M8.25 18h7.5" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

const TagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export default function ExercisesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <ExercisesPageContent />
    </Suspense>
  )
}
