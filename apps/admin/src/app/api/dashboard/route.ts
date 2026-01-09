import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export interface DashboardResponse {
  users: {
    total: number;
    newThisWeek: number;
    newLastWeek: number;
    recentSignups: Array<{
      id: string;
      name: string | null;
      phoneNumber: string;
      createdAt: Date;
      hasProfile: boolean;
    }>;
    signupsByDay: Array<{ date: string; count: number }>;
  };
  subscriptions: {
    activeCount: number;
    activeLastWeek: number;
  };
  messages: {
    totalToday: number;
    totalYesterday: number;
    pending: number;
    failed: number;
    successRate: number;
    statsByDay: Array<{
      date: string;
      delivered: number;
      pending: number;
      failed: number;
    }>;
  };
  pageVisits?: {
    totalThisWeek: number;
    totalLastWeek: number;
    bySource: Array<{ source: string | null; count: number }>;
  };
}

export async function GET() {
  try {
    const { repos } = await getAdminContext();

    // Date calculations
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all data in parallel
    const [
      // User metrics
      totalUsers,
      newUsersThisWeek,
      newUsersLastWeek,
      recentSignups,
      signupsByDay,
      // Subscription metrics
      activeSubscriptions,
      // Message metrics
      messagesToday,
      messagesYesterday,
      currentMessageStats,
      messageStatsByDay,
      // Page visit metrics
      pageVisitsThisWeek,
      pageVisitsLastWeek,
      pageVisitsBySource,
    ] = await Promise.all([
      // Users
      repos.user.countTotal(),
      repos.user.countByDateRange(thisWeekStart, now),
      repos.user.countByDateRange(lastWeekStart, thisWeekStart),
      repos.user.getRecentSignups(5),
      repos.user.getSignupsByDay(thirtyDaysAgo, now),
      // Subscriptions
      repos.subscription.countActive(),
      // Messages
      repos.message.getStatsByDateRange(todayStart, now),
      repos.message.getStatsByDateRange(yesterdayStart, todayStart),
      repos.message.getStats(),
      repos.message.getStatsByDay(thirtyDaysAgo, now),
      // Page visits
      repos.pageVisit.getTotalVisits(thisWeekStart, now),
      repos.pageVisit.getTotalVisits(lastWeekStart, thisWeekStart),
      repos.pageVisit.getVisitCountsBySource(thisWeekStart, now),
    ]);

    // Calculate success rate (delivered / total * 100)
    const totalDeliverable = messagesToday.delivered + messagesToday.failed;
    const successRate = totalDeliverable > 0
      ? Math.round((messagesToday.delivered / totalDeliverable) * 100)
      : 100;

    // Check if users have profiles (simplified - just check recent signups)
    const recentWithProfile = await Promise.all(
      recentSignups.map(async (user) => {
        // Check if user has a profile by checking if profile exists
        const userWithProfile = await repos.user.findWithProfile(user.id);
        return {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          hasProfile: !!userWithProfile?.profile,
        };
      })
    );

    const response: DashboardResponse = {
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        newLastWeek: newUsersLastWeek,
        recentSignups: recentWithProfile,
        signupsByDay,
      },
      subscriptions: {
        activeCount: activeSubscriptions,
        activeLastWeek: activeSubscriptions, // Simplified - use current count
      },
      messages: {
        totalToday: messagesToday.total,
        totalYesterday: messagesYesterday.total,
        pending: currentMessageStats.pending,
        failed: currentMessageStats.failed,
        successRate,
        statsByDay: messageStatsByDay,
      },
      pageVisits: {
        totalThisWeek: pageVisitsThisWeek,
        totalLastWeek: pageVisitsLastWeek,
        bySource: pageVisitsBySource,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching dashboard data',
      },
      { status: 500 }
    );
  }
}
