'use client'

import { useRouter } from 'next/navigation'
import { AdminProgramOwner, ProgramOwnerSort } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/shared/utils/date'
import { EmptyState } from './EmptyState'
import { Building2 } from 'lucide-react'

interface ProgramOwnersTableProps {
  owners: AdminProgramOwner[]
  isLoading?: boolean
  sort?: ProgramOwnerSort
  onSortChange?: (sort: ProgramOwnerSort) => void
}

export function ProgramOwnersTable({
  owners,
  isLoading = false,
  sort,
  onSortChange
}: ProgramOwnersTableProps) {
  const handleSort = (field: ProgramOwnerSort['field']) => {
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
    return <ProgramOwnersTableSkeleton />
  }

  if (owners.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
        <EmptyState
          icon={Building2}
          title="No program owners found"
          description="No program owners match your current filters. Try creating a new coach or organization."
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
                  label="Owner"
                  field="displayName"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">
                <SortableHeader
                  label="Type"
                  field="ownerType"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Programs"
                  field="programCount"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
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
            {owners.map((owner) => (
              <OwnerRow key={owner.id} owner={owner} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: ProgramOwnerSort['field']
  currentSort?: ProgramOwnerSort
  onSort: (field: ProgramOwnerSort['field']) => void
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

interface OwnerRowProps {
  owner: AdminProgramOwner
}

function OwnerRow({ owner }: OwnerRowProps) {
  const router = useRouter()
  const initials = owner.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleRowClick = () => {
    router.push(`/program-owners/${owner.id}`)
  }

  const typeColors: Record<string, string> = {
    coach: 'bg-blue-100 text-blue-800',
    trainer: 'bg-green-100 text-green-800',
    influencer: 'bg-orange-100 text-orange-800',
    admin: 'bg-purple-100 text-purple-800',
  }

  return (
    <tr
      className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="hidden md:flex">
            {owner.avatarUrl ? (
              <AvatarImage src={owner.avatarUrl} alt={owner.displayName} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{owner.displayName}</div>
            {owner.bio && (
              <div className="text-sm text-muted-foreground hidden md:block max-w-xs truncate">
                {owner.bio}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="p-4">
        <Badge className={`${typeColors[owner.ownerType]} border-0`}>
          {owner.ownerType}
        </Badge>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="font-medium">{owner.programCount}</div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="font-medium">{owner.enrollmentCount}</div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="text-sm text-muted-foreground">
          {formatRelative(owner.createdAt)}
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <Badge variant={owner.isActive ? 'default' : 'secondary'}>
          {owner.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
    </tr>
  )
}

function ProgramOwnersTableSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Type</th>
              <th className="hidden md:table-cell p-4 text-left">Programs</th>
              <th className="hidden md:table-cell p-4 text-left">Enrollments</th>
              <th className="hidden md:table-cell p-4 text-left">Created</th>
              <th className="hidden md:table-cell p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-8" />
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
