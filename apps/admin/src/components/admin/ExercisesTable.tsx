'use client'

import { useRouter } from 'next/navigation'
import { AdminExercise, ExerciseSort, ExerciseMatchMethod } from './types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/shared/utils/date'

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
      <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No exercises found</p>
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
                  label="Exercise"
                  field="name"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">
                <SortableHeader
                  label="Category"
                  field="category"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Level"
                  field="level"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
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
}

const matchMethodLabels: Record<ExerciseMatchMethod, string> = {
  exact: 'Exact',
  fuzzy: 'Fuzzy',
  vector: 'Vector',
}

function ExerciseRow({ exercise }: ExerciseRowProps) {
  const router = useRouter()

  const handleRowClick = () => {
    router.push(`/exercises/${exercise.id}`)
  }

  const categoryColors: Record<string, string> = {
    strength: 'bg-blue-100 text-blue-800',
    stretching: 'bg-green-100 text-green-800',
    cardio: 'bg-red-100 text-red-800',
    plyometrics: 'bg-purple-100 text-purple-800',
    strongman: 'bg-orange-100 text-orange-800',
    powerlifting: 'bg-indigo-100 text-indigo-800',
    'olympic weightlifting': 'bg-yellow-100 text-yellow-800',
  }

  const levelColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    expert: 'bg-red-100 text-red-800',
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
        <Badge className={`${categoryColors[exercise.category] || 'bg-gray-100 text-gray-800'} border-0 text-xs`}>
          {formatLabel(exercise.category)}
        </Badge>
      </td>

      <td className="hidden md:table-cell p-4">
        <Badge className={`${levelColors[exercise.level] || 'bg-gray-100 text-gray-800'} border-0 text-xs`}>
          {formatLabel(exercise.level)}
        </Badge>
      </td>

      <td className="hidden md:table-cell p-4">
        <span className="text-sm">
          {exercise.equipment ? formatLabel(exercise.equipment) : '-'}
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
              <th className="p-4 text-left">Category</th>
              <th className="hidden md:table-cell p-4 text-left">Level</th>
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
                  <Skeleton className="h-5 w-24" />
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
