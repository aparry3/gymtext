'use client';

import { Suspense } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PromoteEditor } from '@/components/admin/promote/PromoteEditor';

function PromoteEditorSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur animate-pulse">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PromotePageContent() {
  return (
    <div className="container mx-auto max-w-full px-4 py-6">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_38%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.08),transparent_34%),linear-gradient(to_bottom,rgba(248,250,252,0.88),rgba(241,245,249,0.94))]" />
      <div className="space-y-2">
        <AdminHeader
          title="Promote to Production"
          subtitle="Compare sandbox and production config, then promote changes"
        />
        <PromoteEditor />
      </div>
    </div>
  );
}

export default function PromotePage() {
  return (
    <Suspense fallback={<PromoteEditorSkeleton />}>
      <PromotePageContent />
    </Suspense>
  );
}
