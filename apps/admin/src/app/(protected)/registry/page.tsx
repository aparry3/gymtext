'use client';

import { Suspense } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { RegistryEditor } from '@/components/admin/registry/RegistryEditor';

function RegistryEditorSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] mt-6">
      {/* Tab bar skeleton */}
      <div className="flex border-b mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex gap-4">
        <aside className="w-64 flex-shrink-0 border rounded-lg bg-white animate-pulse">
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 border rounded-lg bg-white animate-pulse">
          <div className="p-4 border-b">
            <div className="h-6 bg-gray-200 rounded w-48" />
          </div>
          <div className="p-4">
            <div className="h-96 bg-gray-100 rounded" />
          </div>
        </main>
      </div>
    </div>
  );
}

function RegistryPageContent() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <div className="space-y-2">
        <AdminHeader
          title="Registry"
          subtitle="Manage tools, context providers, and agent extensions"
        />
        <RegistryEditor />
      </div>
    </div>
  );
}

export default function RegistryPage() {
  return (
    <Suspense fallback={<RegistryEditorSkeleton />}>
      <RegistryPageContent />
    </Suspense>
  );
}
