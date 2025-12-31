'use client';

import { Suspense } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CalendarView } from '@/components/admin/calendar/CalendarView';

function CalendarSkeleton() {
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        {/* Month header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-32" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-sm text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminCalendarPageContent() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-2">
          <AdminHeader
            title="Day Images Calendar"
            subtitle="Set custom images for specific days (holidays, themes)"
          />

          <Suspense fallback={<CalendarSkeleton />}>
            <CalendarView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <AdminCalendarPageContent />
    </Suspense>
  );
}
