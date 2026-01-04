'use client';

import { useState, useCallback, useEffect } from 'react';
import { DomainTree } from './DomainTree';
import { PromptEditorPane } from './PromptEditorPane';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { RoleTabs } from './RoleTabs';
import type { SelectedPrompt, PromptRole, Prompt } from './types';

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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No prompt selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select an agent from the sidebar to edit its prompts.
        </p>
      </div>
    </div>
  );
}

export function PromptsEditor() {
  const [selectedPrompt, setSelectedPrompt] = useState<SelectedPrompt | null>(null);
  const [selectedRole, setSelectedRole] = useState<PromptRole>('system');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [revertTrigger, setRevertTrigger] = useState(0);

  // Handler for tree selection
  const handleAgentSelect = useCallback(
    (agentId: string, availableRoles: PromptRole[]) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;

      setSelectedPrompt({ agentId, availableRoles });
      setSelectedRole(availableRoles[0]);
      setIsDirty(false);
      setIsHistoryOpen(false);
    },
    [isDirty]
  );

  // Handler for role change
  const handleRoleChange = useCallback(
    (role: PromptRole) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;

      setSelectedRole(role);
      setIsDirty(false);
    },
    [isDirty]
  );

  // Handler for revert
  const handleRevert = useCallback((version: Prompt) => {
    // Trigger a save with the old content
    fetch(`/api/prompts/${version.id}/${version.role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: version.value }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          // Increment trigger to force editor refresh
          setRevertTrigger((prev) => prev + 1);
        }
      })
      .catch((err) => {
        console.error('Failed to revert:', err);
        alert('Failed to revert to previous version');
      });
  }, []);

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
      {/* Left Sidebar - Domain Tree */}
      <aside className="w-64 flex-shrink-0 overflow-y-auto border rounded-lg bg-white shadow-sm">
        <DomainTree onSelect={handleAgentSelect} selectedAgentId={selectedPrompt?.agentId} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedPrompt ? (
          <>
            {/* Role Tabs */}
            <RoleTabs
              availableRoles={selectedPrompt.availableRoles}
              selectedRole={selectedRole}
              onRoleChange={handleRoleChange}
            />

            {/* Editor */}
            <PromptEditorPane
              key={`${selectedPrompt.agentId}-${selectedRole}-${revertTrigger}`}
              agentId={selectedPrompt.agentId}
              role={selectedRole}
              onDirtyChange={setIsDirty}
              onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
              isHistoryOpen={isHistoryOpen}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Right Sidebar - Version History */}
      {isHistoryOpen && selectedPrompt && (
        <aside className="w-80 flex-shrink-0">
          <VersionHistoryPanel
            key={`history-${selectedPrompt.agentId}-${selectedRole}-${revertTrigger}`}
            agentId={selectedPrompt.agentId}
            role={selectedRole}
            onRevert={handleRevert}
            onClose={() => setIsHistoryOpen(false)}
          />
        </aside>
      )}
    </div>
  );
}
