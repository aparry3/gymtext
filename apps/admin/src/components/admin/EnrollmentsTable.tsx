'use client'

import { useState } from 'react'
import { AdminEnrollment, EnrollmentSort, EnrollmentStatus } from './types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatRelative } from '@/shared/utils/date'
import { EmptyState } from './EmptyState'
import { UserCheck } from 'lucide-react'

interface EnrollmentsTableProps {
  enrollments: AdminEnrollment[]
  isLoading?: boolean
  sort?: EnrollmentSort
  onSortChange?: (sort: EnrollmentSort) => void
  onAction?: (enrollmentId: string, action: 'pause' | 'resume' | 'cancel' | 'complete') => Promise<void>
}

export function EnrollmentsTable({
  enrollments,
  isLoading = false,
  sort,
  onSortChange,
  onAction,
}: EnrollmentsTableProps) {
  const handleSort = (field: EnrollmentSort['field']) => {
    if (!onSortChange) return

    if (sort?.field === field) {
      onSortChange({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      onSortChange({ field, direction: 'asc' })
    }
  }

  if (isLoading) {
    return <EnrollmentsTableSkeleton />
  }

  if (enrollments.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
        <EmptyState
          icon={UserCheck}
          title="No enrollments found"
          description="No enrollments match your current filters. Try adjusting your search."
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left">
                <SortableHeader
                  label="Client"
                  field="clientName"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">Phone</th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Start Date"
                  field="startDate"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Week"
                  field="currentWeek"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">
                <SortableHeader
                  label="Status"
                  field="status"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <EnrollmentRow
                key={enrollment.id}
                enrollment={enrollment}
                onAction={onAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: EnrollmentSort['field']
  currentSort?: EnrollmentSort
  onSort: (field: EnrollmentSort['field']) => void
}

function SortableHeader({ label, field, currentSort, onSort }: SortableHeaderProps) {
  const isActive = currentSort?.field === field

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span>{label}</span>
      {isActive && (
        currentSort?.direction === 'asc' ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        )
      )}
    </Button>
  )
}

interface EnrollmentRowProps {
  enrollment: AdminEnrollment
  onAction?: (enrollmentId: string, action: 'pause' | 'resume' | 'cancel' | 'complete') => Promise<void>
}

function EnrollmentRow({ enrollment, onAction }: EnrollmentRowProps) {
  const [isActioning, setIsActioning] = useState(false)

  const statusColors: Record<EnrollmentStatus, string> = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-amber-100 text-amber-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  const handleAction = async (action: 'pause' | 'resume' | 'cancel' | 'complete') => {
    if (!onAction) return

    setIsActioning(true)
    try {
      await onAction(enrollment.id, action)
    } finally {
      setIsActioning(false)
    }
  }

  const availableActions = getAvailableActions(enrollment.status)

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200">
      <td className="p-4">
        <div className="font-medium">{enrollment.clientName}</div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="text-sm text-muted-foreground">{enrollment.clientPhone}</div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="text-sm text-muted-foreground">
          {formatRelative(enrollment.startDate)}
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="font-medium">Week {enrollment.currentWeek}</div>
      </td>

      <td className="p-4">
        <Badge className={`${statusColors[enrollment.status]} border-0`}>
          {enrollment.status}
        </Badge>
      </td>

      <td className="p-4">
        {availableActions.length > 0 && onAction && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isActioning}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-32 p-1">
              {availableActions.map((action) => (
                <button
                  key={action.value}
                  onClick={() => handleAction(action.value)}
                  className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${action.destructive ? 'text-destructive' : ''}`}
                >
                  {action.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </td>
    </tr>
  )
}

function getAvailableActions(status: EnrollmentStatus): { label: string; value: 'pause' | 'resume' | 'cancel' | 'complete'; destructive?: boolean }[] {
  switch (status) {
    case 'active':
      return [
        { label: 'Pause', value: 'pause' },
        { label: 'Complete', value: 'complete' },
        { label: 'Cancel', value: 'cancel', destructive: true },
      ]
    case 'paused':
      return [
        { label: 'Resume', value: 'resume' },
        { label: 'Cancel', value: 'cancel', destructive: true },
      ]
    case 'completed':
    case 'cancelled':
      return []
    default:
      return []
  }
}

function EnrollmentsTableSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left">Client</th>
              <th className="hidden md:table-cell p-4 text-left">Phone</th>
              <th className="hidden md:table-cell p-4 text-left">Start Date</th>
              <th className="hidden md:table-cell p-4 text-left">Week</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-8 w-8" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Simple icons
const ChevronUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
)

const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

const MoreHorizontal = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
)
