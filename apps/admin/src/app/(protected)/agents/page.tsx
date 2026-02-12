'use client';

import { Suspense } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AgentsEditor } from '@/components/admin/agents/AgentsEditor';

function AgentsEditorSkeleton() {
  return (
    <div className="mt-6 flex min-h-[calc(100vh-180px)] gap-4">
      {/* Sidebar skeleton */}
      <aside className="w-64 flex-shrink-0 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur animate-pulse">
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur animate-pulse">
        <div className="p-4 border-b border-slate-200/70">
          <div className="h-6 bg-slate-200 rounded w-48" />
        </div>
        <div className="p-4 space-y-4">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </main>
    </div>
  );
}

function AdminAgentsPageContent() {
  return (
    <div className="container mx-auto max-w-full px-4 py-6">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_38%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.08),transparent_34%),linear-gradient(to_bottom,rgba(248,250,252,0.88),rgba(241,245,249,0.94))]" />
      <div className="space-y-2">
        {/* Header */}
        <AdminHeader
          title="Agent Definitions"
          subtitle="Configure AI agents with prompts, models, and parameters"
        />

        {/* Editor */}
        <AgentsEditor />
      </div>
    </div>
  );
}

export default function AdminAgentsPage() {
  return (
    <Suspense fallback={<AgentsEditorSkeleton />}>
      <AdminAgentsPageContent />
    </Suspense>
  );
}
