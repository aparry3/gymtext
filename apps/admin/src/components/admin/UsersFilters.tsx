'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserFilters } from './types'

interface UsersFiltersProps {
  onFiltersChange: (filters: UserFilters) => void
  isLoading?: boolean
}

export function UsersFilters({ onFiltersChange, isLoading = false }: UsersFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<UserFilters>({
    search: searchParams.get('search') || undefined,
    hasEmail: searchParams.get('hasEmail') === 'true' || undefined,
    hasProfile: searchParams.get('hasProfile') === 'true' || undefined,
    gender: searchParams.get('gender') || undefined,
    timezone: searchParams.get('timezone') || undefined,
    isActive: searchParams.get('isActive') === 'true' || undefined,
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

    const url = params.toString() ? `?${params.toString()}` : '/users'
    router.replace(url, { scroll: false })
    onFiltersChange(filters)
  }, [filters, onFiltersChange, router])

  const handleFilterChange = useCallback((key: keyof UserFilters, value: boolean | string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const removeFilter = useCallback((key: keyof UserFilters) => {
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

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
            <div className="space-y-4">
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

              {/* Email Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasEmail === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('hasEmail', 
                      filters.hasEmail === true ? undefined : true
                    )}
                  >
                    Has Email
                  </Button>
                  <Button
                    variant={filters.hasEmail === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('hasEmail', 
                      filters.hasEmail === false ? undefined : false
                    )}
                  >
                    No Email
                  </Button>
                </div>
              </div>

              {/* Profile Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasProfile === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('hasProfile', 
                      filters.hasProfile === true ? undefined : true
                    )}
                  >
                    Has Profile
                  </Button>
                  <Button
                    variant={filters.hasProfile === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('hasProfile', 
                      filters.hasProfile === false ? undefined : false
                    )}
                  >
                    No Profile
                  </Button>
                </div>
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {['male', 'female', 'other'].map((gender) => (
                    <Button
                      key={gender}
                      variant={filters.gender === gender ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('gender', 
                        filters.gender === gender ? undefined : gender
                      )}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Button>
                  ))}
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
          {filters.hasEmail !== undefined && (
            <FilterBadge
              label={filters.hasEmail ? 'Has Email' : 'No Email'}
              onRemove={() => removeFilter('hasEmail')}
            />
          )}
          {filters.hasProfile !== undefined && (
            <FilterBadge
              label={filters.hasProfile ? 'Has Profile' : 'No Profile'}
              onRemove={() => removeFilter('hasProfile')}
            />
          )}
          {filters.gender && (
            <FilterBadge
              label={`Gender: ${filters.gender}`}
              onRemove={() => removeFilter('gender')}
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

// Simple icons if not available
const Search = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const Filter = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" />
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)