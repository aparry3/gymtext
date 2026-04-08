'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminProgram, ProgramSort, OwnerType } from './types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
      <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No programs found</p>
        </div>
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
              <th className="p-4 text-right">Actions</th>
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
  const [isBusy, setIsBusy] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleRowClick = () => {
    router.push(`/programs/${program.id}`)
  }

  const handleDuplicate = async () => {
    if (isBusy) return
    setIsBusy(true)
    try {
      const response = await fetch(`/api/programs/${program.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to duplicate program')
      }
      router.push(`/programs/${result.data.program.id}`)
    } catch (err) {
      console.error('Error duplicating program:', err)
      alert(err instanceof Error ? err.message : 'Failed to duplicate program')
      setIsBusy(false)
    }
  }

  const handleDelete = async () => {
    if (isBusy) return
    setIsBusy(true)
    setDeleteError(null)
    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete program')
      }
      setDeleteOpen(false)
      router.refresh()
    } catch (err) {
      console.error('Error deleting program:', err)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete program')
    } finally {
      setIsBusy(false)
    }
  }

  const canConfirmDelete = deleteConfirmText.trim() === program.name

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

      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isBusy} aria-label="Program actions">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setDeleteConfirmText('')
                setDeleteError(null)
                setDeleteOpen(true)
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={deleteOpen} onOpenChange={(open) => !isBusy && setDeleteOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete program</DialogTitle>
              <DialogDescription>
                This permanently deletes <span className="font-semibold">{program.name}</span> and
                all of its versions. This cannot be undone. Type the program name to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={program.name}
                autoFocus
              />
              {deleteError && (
                <p className="text-sm text-red-600">{deleteError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!canConfirmDelete || isBusy}
              >
                {isBusy ? 'Deleting…' : 'Delete program'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  )
}

const MoreHorizontalIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
)

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
              <th className="p-4 text-right">Actions</th>
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
                <td className="p-4">
                  <Skeleton className="h-8 w-20 ml-auto" />
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
