'use client'

import { useRouter } from 'next/navigation'
import { EmptyState } from './EmptyState'
import { AdminUser, UserSort } from './types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/shared/utils/date'

interface UsersTableProps {
  users: AdminUser[]
  isLoading?: boolean
  sort?: UserSort
  onSortChange?: (sort: UserSort) => void
}

export function UsersTable({ 
  users, 
  isLoading = false, 
  sort, 
  onSortChange 
}: UsersTableProps) {
  const handleSort = (field: UserSort['field']) => {
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
    return <UsersTableSkeleton />
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
        title="No users found"
        description="Users will appear here once they sign up or are added."
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
                  label="User" 
                  field="name" 
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="p-4 text-left">
                <SortableHeader 
                  label="Contact" 
                  field="email" 
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">Details</th>
              <th className="hidden md:table-cell p-4 text-left">
                <SortableHeader
                  label="Created"
                  field="createdAt"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="hidden md:table-cell p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SortableHeaderProps {
  label: string
  field: UserSort['field']
  currentSort?: UserSort
  onSort: (field: UserSort['field']) => void
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

interface UserRowProps {
  user: AdminUser
}

function UserRow({ user }: UserRowProps) {
  const router = useRouter()
  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??'

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1)
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
    }
    return phone
  }

  const handleRowClick = () => {
    router.push(`/users/${user.id}`)
  }

  return (
    <tr
      className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="hidden md:flex">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name || 'Unnamed User'}</div>
            <div className="text-sm text-muted-foreground hidden md:block">
              {user.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      </td>

      <td className="p-4">
        <div className="space-y-1">
          <div className="text-sm hidden md:block">
            {user.email ? user.email : (
              <span className="text-muted-foreground">No email</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPhone(user.phoneNumber)}
          </div>
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="flex flex-wrap gap-2">
          {user.age && (
            <Badge variant="outline" className="text-xs">
              {user.age}y
            </Badge>
          )}
          {user.gender && (
            <Badge variant="outline" className="text-xs">
              {user.gender}
            </Badge>
          )}
          {user.timezone && (
            <Badge variant="outline" className="text-xs">
              {user.timezone}
            </Badge>
          )}
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <div className="text-sm text-muted-foreground">
          {formatRelative(user.createdAt)}
        </div>
      </td>

      <td className="hidden md:table-cell p-4">
        <Button variant="ghost" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View
        </Button>
      </td>
    </tr>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Contact</th>
              <th className="hidden md:table-cell p-4 text-left">Details</th>
              <th className="hidden md:table-cell p-4 text-left">Created</th>
              <th className="hidden md:table-cell p-4 text-left">Actions</th>
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
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </td>
                <td className="hidden md:table-cell p-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="hidden md:table-cell p-4">
                  <Skeleton className="h-8 w-16" />
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
const Eye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

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