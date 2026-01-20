'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MessagesFilters } from '@/components/admin/MessagesFilters';
import { MessagesTable } from '@/components/admin/MessagesTable';
import { Pagination } from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  AdminMessageItem,
  MessageFilters,
  MessageStats,
  MessageSource,
} from '@/components/admin/types';

function AdminMessagesPageContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<AdminMessageItem[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 0,
    inbound: 0,
    outbound: 0,
    pending: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Parse initial filters from search params
  const initialFilters: MessageFilters = {
    search: searchParams?.get('search') || undefined,
    direction:
      (searchParams?.get('direction') as MessageFilters['direction']) ||
      undefined,
    status:
      (searchParams?.get('status') as MessageFilters['status']) || undefined,
  };

  const [filters, setFilters] = useState<MessageFilters>(initialFilters);

  // API data fetcher
  const fetchMessages = useCallback(
    async (filters: MessageFilters, page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.direction) params.set('direction', filters.direction);
        if (filters.status) params.set('status', filters.status);

        params.set('page', String(page));
        params.set('pageSize', '50');

        const response = await fetch(`/api/messages?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch messages');
        }

        const {
          messages: fetchedMessages,
          pagination,
          stats: fetchedStats,
        } = result.data;

        setMessages(fetchedMessages);
        setTotalPages(pagination.totalPages);
        setStats(fetchedStats);
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchMessages(filters, currentPage);
  }, [fetchMessages, filters, currentPage]);

  const handleFiltersChange = useCallback((newFilters: MessageFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMessages(filters, currentPage);
  }, [fetchMessages, filters, currentPage]);

  const handleCancelMessage = useCallback(async (messageId: string, source: MessageSource) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to cancel message');
      }

      // Refresh the messages list after cancellation
      fetchMessages(filters, currentPage);
    } catch (err) {
      console.error('Error cancelling message:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel message');
    }
  }, [fetchMessages, filters, currentPage]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
          {/* Header */}
          <AdminHeader
            title="Messages"
            subtitle={`${stats.totalMessages} total messages`}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatsCard
              title="Total"
              value={stats.totalMessages}
              icon={<MessagesIcon className="h-5 w-5" />}
              variant="primary"
              isLoading={isLoading}
            />
            <StatsCard
              title="Inbound"
              value={stats.inbound}
              icon={<InboundIcon className="h-5 w-5" />}
              variant="warning"
              isLoading={isLoading}
            />
            <StatsCard
              title="Outbound"
              value={stats.outbound}
              icon={<OutboundIcon className="h-5 w-5" />}
              variant="info"
              isLoading={isLoading}
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={<ClockIcon className="h-5 w-5" />}
              variant="secondary"
              isLoading={isLoading}
            />
            <StatsCard
              title="Failed"
              value={stats.failed}
              icon={<AlertIcon className="h-5 w-5" />}
              variant="danger"
              isLoading={isLoading}
            />
          </div>

          {/* Error Banner */}
          {error && (
            <Card className="border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-destructive hover:underline"
                >
                  Retry
                </button>
              </div>
            </Card>
          )}

          {/* Filters */}
          <MessagesFilters
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />

          {/* Messages Table */}
          <MessagesTable
            messages={messages}
            isLoading={isLoading}
            showUserColumn={true}
            onCancelMessage={handleCancelMessage}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={stats.totalMessages}
              itemsPerPage={50}
            />
          )}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger';
  isLoading?: boolean;
}

function StatsCard({
  title,
  value,
  icon,
  variant,
  isLoading = false,
}: StatsCardProps) {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    info: 'bg-sky-50 text-sky-600 border-sky-100',
    secondary: 'bg-gray-50 text-gray-600 border-gray-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
  };

  if (isLoading) {
    return (
      <Card className="p-4 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-xl transition-shadow duration-200 border group">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 ${variantStyles[variant]} group-hover:scale-105`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// Icons
const MessagesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
    />
  </svg>
);

const InboundIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25"
    />
  </svg>
);

const OutboundIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        </div>
      }
    >
      <AdminMessagesPageContent />
    </Suspense>
  );
}
