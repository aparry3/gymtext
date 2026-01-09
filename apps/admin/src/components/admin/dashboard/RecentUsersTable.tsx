'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface RecentUser {
  id: string;
  name: string | null;
  phoneNumber: string;
  createdAt: Date;
  hasProfile: boolean;
}

interface RecentUsersTableProps {
  users: RecentUser[];
  isLoading?: boolean;
}

export function RecentUsersTable({ users, isLoading = false }: RecentUsersTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-100 shadow-sm">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Signups</h3>
        <Link
          href="/users"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent signups
          </p>
        ) : (
          users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.name || 'Unnamed User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.phoneNumber} &middot;{' '}
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <Badge
                variant={user.hasProfile ? 'default' : 'secondary'}
                className={
                  user.hasProfile
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                }
              >
                {user.hasProfile ? 'Profile' : 'No profile'}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
