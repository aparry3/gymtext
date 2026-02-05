'use client';

import { useState, useCallback, useEffect } from 'react';
import { AgentConfigList } from './AgentConfigList';
import { AgentConfigEditor } from './AgentConfigEditor';

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No agent selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select an agent from the sidebar to edit its configuration.
        </p>
      </div>
    </div>
  );
}

export function AgentConfigsEditor() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handler for agent selection
  const handleAgentSelect = useCallback(
    (agentId: string) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;

      setSelectedAgentId(agentId);
      setIsDirty(false);
    },
    [isDirty]
  );

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className="flex h-[calc(100vh-180px)] gap-4 mt-6">
      {/* Left Sidebar - Agent List */}
      <aside className="w-72 flex-shrink-0 overflow-y-auto border rounded-lg bg-white shadow-sm">
        <AgentConfigList selectedId={selectedAgentId} onSelect={handleAgentSelect} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedAgentId ? (
          <AgentConfigEditor
            key={selectedAgentId}
            agentId={selectedAgentId}
            onDirtyChange={setIsDirty}
            refreshKey={refreshKey}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
