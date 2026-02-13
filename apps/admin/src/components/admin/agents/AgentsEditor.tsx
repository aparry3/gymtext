'use client';

import { useState, useCallback, useEffect } from 'react';
import { AgentDomainTree } from './AgentDomainTree';
import { AgentEditorPane } from './AgentEditorPane';
import { AgentHistoryPanel } from './AgentHistoryPanel';
import { AgentExtensionsPane } from './AgentExtensionsPane';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { SelectedAgent, AdminAgentDefinition } from './types';

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/55 backdrop-blur">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No agent selected</h3>
        <p className="mt-1 text-sm text-slate-500">
          Select an agent from the sidebar to edit its configuration.
        </p>
      </div>
    </div>
  );
}

export function AgentsEditor() {
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null);
  const [activeTab, setActiveTab] = useState<string>('definition');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [revertTrigger, setRevertTrigger] = useState(0);

  // Handler for tree selection
  const handleAgentSelect = useCallback(
    (agentId: string) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;

      setSelectedAgent({ agentId });
      setActiveTab('definition');
      setIsDirty(false);
      setIsHistoryOpen(false);
    },
    [isDirty]
  );

  // Handler for tab change
  const handleTabChange = useCallback(
    (value: string) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;
      setActiveTab(value);
      setIsHistoryOpen(false);
    },
    [isDirty]
  );

  // Handler for revert
  const handleRevert = useCallback((version: AdminAgentDefinition) => {
    fetch(`/api/agent-definitions/${version.agentId}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId: version.versionId }),
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
    <div className="mt-6 flex min-h-[calc(100vh-180px)] gap-4">
      {/* Left Sidebar - Domain Tree */}
      <aside className="w-64 flex-shrink-0 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/85 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.45)] backdrop-blur">
        <AgentDomainTree onSelect={handleAgentSelect} selectedAgentId={selectedAgent?.agentId} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedAgent ? (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsList className="self-start mb-2">
              <TabsTrigger value="definition">Definition</TabsTrigger>
              <TabsTrigger value="extensions">Extensions</TabsTrigger>
            </TabsList>
            <TabsContent value="definition" className="flex-1 flex flex-col min-h-0">
              <AgentEditorPane
                key={`${selectedAgent.agentId}-${revertTrigger}`}
                agentId={selectedAgent.agentId}
                onDirtyChange={setIsDirty}
                onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
                isHistoryOpen={isHistoryOpen}
              />
            </TabsContent>
            <TabsContent value="extensions" className="flex-1 flex flex-col min-h-0">
              <AgentExtensionsPane
                key={`ext-${selectedAgent.agentId}`}
                agentId={selectedAgent.agentId}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Right Sidebar - Version History (only on definition tab) */}
      {isHistoryOpen && selectedAgent && activeTab === 'definition' && (
        <aside className="w-80 flex-shrink-0">
          <AgentHistoryPanel
            key={`history-${selectedAgent.agentId}-${revertTrigger}`}
            agentId={selectedAgent.agentId}
            onRevert={handleRevert}
            onClose={() => setIsHistoryOpen(false)}
          />
        </aside>
      )}
    </div>
  );
}
