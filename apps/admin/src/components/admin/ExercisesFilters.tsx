'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ExerciseFilters } from './types'

interface ExercisesFiltersProps {
  onFiltersChange: (filters: ExerciseFilters) => void
  isLoading?: boolean
  categories?: string[]
  equipment?: string[]
}

const levels = ['beginner', 'intermediate', 'expert']
const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
}

const muscles = [
  'abdominals',
  'adductors',
  'abductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'lower back',
  'middle back',
  'neck',
  'quadriceps',
  'shoulders',
  'traps',
  'triceps',
]

export function ExercisesFilters({
  onFiltersChange,
  isLoading = false,
  categories = [],
  equipment = []
}: ExercisesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<ExerciseFilters>({
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    level: searchParams.get('level') || undefined,
    equipment: searchParams.get('equipment') || undefined,
    muscle: searchParams.get('muscle') || undefined,
    isActive: searchParams.get('isActive') === 'true' ? true :
              searchParams.get('isActive') === 'false' ? false : undefined,
  })

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue || undefined }))
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])

  // Update URL and notify parent when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString())
      }
    })

    const url = params.toString() ? `?${params.toString()}` : '/exercises'
    router.replace(url, { scroll: false })
    onFiltersChange(filters)
  }, [filters, onFiltersChange, router])

  const handleFilterChange = useCallback((key: keyof ExerciseFilters, value: boolean | string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const removeFilter = useCallback((key: keyof ExerciseFilters) => {
    setFilters(prev => ({ ...prev, [key]: undefined }))
    if (key === 'search') {
      setSearchValue('')
    }
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchValue('')
    setFilters({})
  }, [])

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={isLoading}>
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      variant={filters.level === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('level',
                        filters.level === level ? undefined : level
                      )}
                    >
                      {levelLabels[level]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Equipment Filter */}
              {equipment.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Equipment</label>
                  <select
                    value={filters.equipment || ''}
                    onChange={(e) => handleFilterChange('equipment', e.target.value || undefined)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">All Equipment</option>
                    {equipment.map((eq) => (
                      <option key={eq} value={eq}>
                        {formatLabel(eq)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Muscle Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Muscle Group</label>
                <select
                  value={filters.muscle || ''}
                  onChange={(e) => handleFilterChange('muscle', e.target.value || undefined)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Muscles</option>
                  {muscles.map((muscle) => (
                    <option key={muscle} value={muscle}>
                      {formatLabel(muscle)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.isActive === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('isActive',
                      filters.isActive === true ? undefined : true
                    )}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filters.isActive === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('isActive',
                      filters.isActive === false ? undefined : false
                    )}
                  >
                    Inactive
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <FilterBadge
              label={`Search: "${filters.search}"`}
              onRemove={() => removeFilter('search')}
            />
          )}
          {filters.category && (
            <FilterBadge
              label={`Category: ${formatLabel(filters.category)}`}
              onRemove={() => removeFilter('category')}
            />
          )}
          {filters.level && (
            <FilterBadge
              label={`Level: ${levelLabels[filters.level]}`}
              onRemove={() => removeFilter('level')}
            />
          )}
          {filters.equipment && (
            <FilterBadge
              label={`Equipment: ${formatLabel(filters.equipment)}`}
              onRemove={() => removeFilter('equipment')}
            />
          )}
          {filters.muscle && (
            <FilterBadge
              label={`Muscle: ${formatLabel(filters.muscle)}`}
              onRemove={() => removeFilter('muscle')}
            />
          )}
          {filters.isActive !== undefined && (
            <FilterBadge
              label={filters.isActive ? 'Active' : 'Inactive'}
              onRemove={() => removeFilter('isActive')}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface FilterBadgeProps {
  label: string
  onRemove: () => void
}

function FilterBadge({ label, onRemove }: FilterBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 h-3 w-3 rounded-full hover:bg-muted-foreground/20"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

// Simple icons
const Search = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const Filter = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)
