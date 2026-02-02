'use client';

import { useState, useCallback, useEffect, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEnvironment } from '@/context/EnvironmentContext';
import Link from 'next/link';
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
} from '@/components/admin/types';

interface UserMessagesPageProps {
  params: Promise<{ id: string }>;
}

function UserMessagesPageContent({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const { mode } = useEnvironment();
  const [messages, setMessages] = useState<AdminMessageItem[]>([]);
  const [userName, setUserName] = useState<string>('');
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
    clientId: userId,
  };

  const [filters, setFilters] = useState<MessageFilters>(initialFilters);

  // API data fetcher
  const fetchMessages = useCallback(
    async (filters: MessageFilters, page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.direction) params.set('direction', filters.direction);
        if (filters.status) params.set('status', filters.status);
        params.set('clientId', userId);
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

        // Get user name from first message
        if (fetchedMessages.length > 0 && fetchedMessages[0].userName) {
          setUserName(fetchedMessages[0].userName);
        }
      } catch (err) {
        setError('Failed to load messages');
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Fetch user info separately if messages are empty
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();
        if (result.success && result.data?.user?.name) {
          setUserName(result.data.user.name);
        }
      } catch {
        // Ignore errors - user name is optional
      }
    };

    if (!userName) {
      fetchUserInfo();
    }
  }, [userId, userName]);

  // Fetch data when filters, page, or environment mode changes
  useEffect(() => {
    fetchMessages(filters, currentPage);
  }, [fetchMessages, filters, currentPage, mode]);

  const handleFiltersChange = useCallback(
    (newFilters: MessageFilters) => {
      setFilters({ ...newFilters, clientId: userId });
      setCurrentPage(1);
    },
    [userId]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMessages(filters, currentPage);
  }, [fetchMessages, filters, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/users" className="hover:text-foreground">
              Users
            </Link>
            <span>/</span>
            <Link
              href={`/users/${userId}`}
              className="hover:text-foreground"
            >
              {userName || userId.slice(0, 8)}
            </Link>
            <span>/</span>
            <span className="text-foreground">Messages</span>
          </nav>

          {/* Header */}
          <AdminHeader
            title={userName ? `${userName}'s Messages` : 'User Messages'}
            subtitle={`${stats.totalMessages} total messages`}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatsCard
              title="Total"
              value={stats.totalMessages}
              variant="primary"
              isLoading={isLoading}
            />
            <StatsCard
              title="Inbound"
              value={stats.inbound}
              variant="warning"
              isLoading={isLoading}
            />
            <StatsCard
              title="Outbound"
              value={stats.outbound}
              variant="info"
              isLoading={isLoading}
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              variant="secondary"
              isLoading={isLoading}
            />
            <StatsCard
              title="Failed"
              value={stats.failed}
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
            basePath={`/users/${userId}/messages`}
          />

          {/* Messages Table - without user column */}
          <MessagesTable
            messages={messages}
            isLoading={isLoading}
            showUserColumn={false}
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
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger';
  isLoading?: boolean;
}

function StatsCard({
  title,
  value,
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
      <Card className="p-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-8" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`p-3 border ${variantStyles[variant].split(' ').slice(0, 2).join(' ')}`}
    >
      <div>
        <p className="text-xs font-medium text-gray-600">{title}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}

export default function UserMessagesPage({ params }: UserMessagesPageProps) {
  const { id } = use(params);

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
      <UserMessagesPageContent userId={id} />
    </Suspense>
  );
}
