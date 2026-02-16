'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, GraduationCap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  id: string;
  type: 'signup' | 'enrollment' | 'message_failed';
  title: string;
  description: string | null;
  timestamp: string;
  href: string | null;
}

const typeConfig = {
  signup: {
    icon: UserPlus,
    color: 'text-green-600 bg-green-50',
  },
  enrollment: {
    icon: GraduationCap,
    color: 'text-blue-600 bg-blue-50',
  },
  message_failed: {
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50',
  },
} as const;

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ActivityFeed({ isLoading: parentLoading }: { isLoading?: boolean }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/dashboard/activity');
        const json = await res.json();
        if (json.success) setEvents(json.data);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchActivity();
  }, []);

  const loading = parentLoading || isLoading;

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No recent activity
        </p>
      ) : (
        <div className="space-y-1">
          {events.map((event) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;

            const content = (
              <div
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  event.href ? 'hover:bg-gray-50 cursor-pointer' : ''
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {event.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
            );

            return event.href ? (
              <Link key={event.id} href={event.href}>
                {content}
              </Link>
            ) : (
              <div key={event.id}>{content}</div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
