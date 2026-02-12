'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ContextTemplateEditor } from './ContextTemplateEditor';
import { TemplateVersionHistory } from './TemplateVersionHistory';

interface ContextProviderMetadata {
  name: string;
  description: string;
  params: { required?: string[]; optional?: string[] };
  templateVariables?: string[];
}

function SidebarSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

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
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No context selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a context provider to edit its template.
        </p>
      </div>
    </div>
  );
}

export function ContextTab() {
  const [providers, setProviders] = useState<ContextProviderMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ContextProviderMetadata | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [revertTrigger, setRevertTrigger] = useState(0);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch('/api/registry/context');
        const result = await response.json();
        if (result.success) {
          setProviders(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch context providers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProviders();
  }, []);

  const handleSelect = useCallback(
    (provider: ContextProviderMetadata) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;
      setSelectedProvider(provider);
      setIsDirty(false);
      setIsHistoryOpen(false);
    },
    [isDirty]
  );

  const handleRevert = useCallback(
    (version: { content: string }) => {
      if (!selectedProvider) return;
      fetch(`/api/registry/context/${selectedProvider.name}/default`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: version.content }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setRevertTrigger((prev) => prev + 1);
          }
        })
        .catch((err) => {
          console.error('Failed to revert:', err);
          alert('Failed to revert to previous version');
        });
    },
    [selectedProvider]
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
    <div className="flex h-full gap-4">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 overflow-y-auto border rounded-lg bg-white shadow-sm">
        <div className="p-3 border-b bg-gray-50/50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Context Providers
          </h3>
        </div>
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <ul className="p-2 space-y-1">
            {providers.map((provider) => (
              <li key={provider.name}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedProvider?.name === provider.name
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(provider)}
                >
                  <span className="font-mono text-xs">{provider.name}</span>
                  {provider.templateVariables && provider.templateVariables.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                      {provider.templateVariables.length} vars
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Main Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedProvider ? (
          <ContextTemplateEditor
            key={`${selectedProvider.name}-${revertTrigger}`}
            contextType={selectedProvider.name}
            templateVariables={selectedProvider.templateVariables}
            onDirtyChange={setIsDirty}
            onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
            isHistoryOpen={isHistoryOpen}
          />
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Right Sidebar - Version History */}
      {isHistoryOpen && selectedProvider && (
        <aside className="w-80 flex-shrink-0">
          <TemplateVersionHistory
            key={`history-${selectedProvider.name}-${revertTrigger}`}
            fetchUrl={`/api/registry/context/${selectedProvider.name}/default/history?limit=20`}
            contentKey="template"
            onRevert={handleRevert}
            onClose={() => setIsHistoryOpen(false)}
          />
        </aside>
      )}
    </div>
  );
}
