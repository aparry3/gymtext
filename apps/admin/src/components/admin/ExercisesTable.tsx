'use client'

import { useRouter } from 'next/navigation'
import { EmptyState } from './EmptyState'
import { AdminExercise, ExerciseSort, ExerciseMatchMethod } from './types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ExercisesTableProps {
  exercises: AdminExercise[]
  isLoading?: boolean
  sort?: ExerciseSort
  onSortChange?: (sort: ExerciseSort) => void
}

export function ExercisesTable({
  exercises,
  isLoading = false,
  sort,
  onSortChange
}: ExercisesTableProps) {
  const handleSort = (field: ExerciseSort['field']) => {
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
    return <ExercisesTableSkeleton />
  }

  if (exercises.length === 0) {
    return (
      <EmptyState
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>}
        title="No exercises found"
        description="Add exercises to build your workout library."
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
                  label="Exercise"
                  field="name"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">
                <SortableHeader
                  label="Type"
                  field="type"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">Movement</th>
              <th className="hidden md:table-cell p-4 text-left">Equipment</th>
              <th className="hidden lg:table-cell p-4 text-left">Muscles</th>
              <th className="hidden md:table-cell p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <ExerciseRow key={exercise.id} exercise={exercise} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: ExerciseSort['field']
  currentSort?: ExerciseSort
  onSort: (field: ExerciseSort['field']) => void
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

interface ExerciseRowProps {
  exercise: AdminExercise
}

const matchMethodColors: Record<ExerciseMatchMethod, string> = {
  exact: 'bg-green-100 text-green-800',
  fuzzy: 'bg-yellow-100 text-yellow-800',
  vector: 'bg-blue-100 text-blue-800',
  text: 'bg-purple-100 text-purple-800',
  exact_lex: 'bg-green-100 text-green-800',
  fuzzy_lex: 'bg-yellow-100 text-yellow-800',
  multi_signal: 'bg-indigo-100 text-indigo-800',
}

const matchMethodLabels: Record<ExerciseMatchMethod, string> = {
  exact: 'Exact',
  fuzzy: 'Fuzzy',
  vector: 'Vector',
  text: 'Text',
  exact_lex: 'Lex Exact',
  fuzzy_lex: 'Lex Fuzzy',
  multi_signal: 'Multi',
}

function ExerciseRow({ exercise }: ExerciseRowProps) {
  const router = useRouter()

  const handleRowClick = () => {
    router.push(`/exercises/${exercise.id}`)
  }

  const typeColors: Record<string, string> = {
    strength: 'bg-blue-100 text-blue-800',
    stretching: 'bg-green-100 text-green-800',
    cardio: 'bg-red-100 text-red-800',
    plyometrics: 'bg-purple-100 text-purple-800',
    strongman: 'bg-orange-100 text-orange-800',
    powerlifting: 'bg-indigo-100 text-indigo-800',
    'olympic weightlifting': 'bg-yellow-100 text-yellow-800',
  }

  const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
  }

  const primaryMuscles = exercise.primaryMuscles?.slice(0, 2) || []
  const hasMoreMuscles = (exercise.primaryMuscles?.length || 0) > 2

  return (
    <tr
      className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{exercise.name}</span>
            {exercise.matchMethod && (
              <span className="inline-flex items-center gap-1">
                <Badge className={`${matchMethodColors[exercise.matchMethod]} border-0 text-xs`}>
                  {matchMethodLabels[exercise.matchMethod]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round((exercise.matchConfidence || 0) * 100)}%
                </span>
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {exercise.matchedOn && exercise.matchMethod !== 'exact' ? (
              <span>matched: &quot;{exercise.matchedOn}&quot;</span>
            ) : (
              <span>{exercise.aliasCount} {exercise.aliasCount === 1 ? 'alias' : 'aliases'}</span>
            )}
          </div>
        </div>
      </td>

      <td className="p-4">
        <Badge className={`${typeColors[exercise.type] || 'bg-gray-100 text-gray-800'} border-0 text-xs`}>
          {formatLabel(exercise.type)}
        </Badge>
      </td>

      <td className="hidden md:table-cell p-4">
        {exercise.movementName ? (
          <Badge variant="outline" className="text-xs">
            {formatLabel(exercise.movementName)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </td>

      <td className="hidden md:table-cell p-4">
        <span className="text-sm">
          {exercise.equipment && exercise.equipment.length > 0
            ? exercise.equipment.map(formatLabel).join(', ')
            : '-'}
        </span>
      </td>

      <td className="hidden lg:table-cell p-4">
        <div className="flex flex-wrap gap-1">
          {primaryMuscles.map((muscle) => (
            <Badge key={muscle} variant="outline" className="text-xs">
              {formatLabel(muscle)}
            </Badge>
          ))}
          {hasMoreMuscles && (
            <Badge variant="outline" className="text-xs">
              +{(exercise.primaryMuscles?.length || 0) - 2}
            </Badge>
          )}
          {primaryMuscles.length === 0 && (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <Badge variant={exercise.isActive ? 'default' : 'secondary'}>
          {exercise.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
    </tr>
  )
}

function ExercisesTableSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left">Exercise</th>
              <th className="p-4 text-left">Type</th>
              <th className="hidden md:table-cell p-4 text-left">Movement</th>
              <th className="hidden md:table-cell p-4 text-left">Equipment</th>
              <th className="hidden lg:table-cell p-4 text-left">Muscles</th>
              <th className="hidden md:table-cell p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </td>
                <td className="p-4">
                  <Skeleton className="h-5 w-20" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="hidden lg:table-cell p-4">
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
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
