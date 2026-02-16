'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEnvironment } from '@/context/EnvironmentContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  MetricCard,
  SignupsChart,
  MessageStatsChart,
  RecentUsersTable,
  PageVisitsCard,
} from '@/components/admin/dashboard';
import { Users, CreditCard, MessageSquare, AlertTriangle, UserPlus, FolderPlus, MailWarning } from 'lucide-react';
import Link from 'next/link';
import type { DashboardResponse } from '@/app/api/dashboard/route';

export default function DashboardPage() {
  const { mode } = useEnvironment();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      setData(result.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, mode]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <AdminHeader
          title="Dashboard"
          subtitle="Overview of GymText activity"
          onRefresh={fetchDashboard}
          isLoading={isLoading}
        />

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchDashboard}
                className="text-sm text-red-600 hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/users/new"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Link>
          <Link
            href="/programs/new"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <FolderPlus className="h-4 w-4" />
            Add Program
          </Link>
          <Link
            href="/messages?status=failed"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <MailWarning className="h-4 w-4" />
            Failed Messages
            {data?.messages.failed ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {data.messages.failed}
              </span>
            ) : null}
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={data?.users.total ?? 0}
            previousValue={data?.users.total ? data.users.total - data.users.newThisWeek : undefined}
            icon={<Users className="h-5 w-5" />}
            isLoading={isLoading}
            href="/users"
          />
          <MetricCard
            title="Active Subscriptions"
            value={data?.subscriptions.activeCount ?? 0}
            previousValue={data?.subscriptions.activeLastWeek}
            icon={<CreditCard className="h-5 w-5" />}
            isLoading={isLoading}
          />
          <MetricCard
            title="Messages Today"
            value={data?.messages.totalToday ?? 0}
            previousValue={data?.messages.totalYesterday}
            icon={<MessageSquare className="h-5 w-5" />}
            isLoading={isLoading}
            href="/messages"
          />
          <MetricCard
            title="Failed Messages"
            value={data?.messages.failed ?? 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            isLoading={isLoading}
            href="/messages?status=failed"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SignupsChart
            data={data?.users.signupsByDay ?? []}
            isLoading={isLoading}
          />
          <RecentUsersTable
            users={data?.users.recentSignups ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MessageStatsChart
            data={data?.messages.statsByDay ?? []}
            isLoading={isLoading}
          />
          {data?.pageVisits && (
            <PageVisitsCard
              totalThisWeek={data.pageVisits.totalThisWeek}
              totalLastWeek={data.pageVisits.totalLastWeek}
              bySource={data.pageVisits.bySource}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
