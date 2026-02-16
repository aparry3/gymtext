'use client'

import { useRouter } from 'next/navigation'
import { EmptyState } from './EmptyState'
import { AdminProgram, ProgramSort, OwnerType } from './types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/shared/utils/date'

interface ProgramsTableProps {
  programs: AdminProgram[]
  isLoading?: boolean
  sort?: ProgramSort
  onSortChange?: (sort: ProgramSort) => void
}

export function ProgramsTable({
  programs,
  isLoading = false,
  sort,
  onSortChange
}: ProgramsTableProps) {
  const handleSort = (field: ProgramSort['field']) => {
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
    return <ProgramsTableSkeleton />
  }

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>}
        title="No programs found"
        description="Create a program to start building workout plans for your users."
      />
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
                  label="Program"
                  field="name"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">
                <SortableHeader
                  label="Owner"
                  field="ownerName"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">Mode</th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Enrollments"
                  field="enrollmentCount"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Created"
                  field="createdAt"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <ProgramRow key={program.id} program={program} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: ProgramSort['field']
  currentSort?: ProgramSort
  onSort: (field: ProgramSort['field']) => void
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

interface ProgramRowProps {
  program: AdminProgram
}

function ProgramRow({ program }: ProgramRowProps) {
  const router = useRouter()

  const handleRowClick = () => {
    router.push(`/programs/${program.id}`)
  }

  const ownerTypeColors: Record<OwnerType, string> = {
    coach: 'bg-blue-100 text-blue-800',
    trainer: 'bg-green-100 text-green-800',
    influencer: 'bg-orange-100 text-orange-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  const modeLabels: Record<string, string> = {
    rolling_start: 'Rolling Start',
    cohort: 'Cohort',
  }

  return (
    <tr
      className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="p-4">
        <div>
          <div className="font-medium">{program.name}</div>
          {program.description && (
            <div className="text-sm text-muted-foreground hidden md:block max-w-xs truncate">
              {program.description}
            </div>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{program.ownerName}</span>
          <Badge className={`${ownerTypeColors[program.ownerType]} border-0 text-xs`}>
            {program.ownerType}
          </Badge>
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <Badge variant="outline">
          {modeLabels[program.schedulingMode] || program.schedulingMode}
        </Badge>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="font-medium">{program.enrollmentCount}</div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="text-sm text-muted-foreground">
          {formatRelative(program.createdAt)}
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="flex gap-1">
          <Badge variant={program.isActive ? 'default' : 'secondary'}>
            {program.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {program.isPublic && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
        </div>
      </td>
    </tr>
  )
}

function ProgramsTableSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left">Program</th>
              <th className="p-4 text-left">Owner</th>
              <th className="hidden md:table-cell p-4 text-left">Mode</th>
              <th className="hidden md:table-cell p-4 text-left">Enrollments</th>
              <th className="hidden md:table-cell p-4 text-left">Created</th>
              <th className="hidden md:table-cell p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-5 w-24" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-5 w-16" />
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
