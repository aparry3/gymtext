'use client';

import { Suspense } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AgentConfigsEditor } from '@/components/admin/agent-configs';

function AgentConfigsEditorSkeleton() {
  return (
    <div className="flex h-[calc(100vh-180px)] gap-4 mt-6">
      {/* Sidebar skeleton */}
      <aside className="w-72 flex-shrink-0 border rounded-lg bg-white animate-pulse">
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 border rounded-lg bg-white animate-pulse">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-48" />
        </div>
        <div className="p-4">
          <div className="h-96 bg-gray-100 rounded" />
        </div>
      </main>
    </div>
  );
}

function AgentConfigsPageContent() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <div className="space-y-2">
        {/* Header */}
        <AdminHeader
          title="Agent Configs"
          subtitle="Manage AI agent prompts and model configuration"
        />

        {/* Editor */}
        <AgentConfigsEditor />
      </div>
    </div>
  );
}

export default function AgentConfigsPage() {
  return (
    <Suspense fallback={<AgentConfigsEditorSkeleton />}>
      <AgentConfigsPageContent />
    </Suspense>
  );
}
