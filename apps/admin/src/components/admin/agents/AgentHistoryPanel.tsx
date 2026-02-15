'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AdminAgentDefinition } from './types';

interface AgentHistoryPanelProps {
  agentId: string;
  onRevert: (version: AdminAgentDefinition) => void;
  onClose: () => void;
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function HistorySkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-2 h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function AgentHistoryPanel({
  agentId,
  onRevert,
  onClose,
}: AgentHistoryPanelProps) {
  const [versions, setVersions] = useState<AdminAgentDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<AdminAgentDefinition | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/agent-definitions/${encodeURIComponent(agentId)}/history?limit=20`
        );
        const result = await response.json();

        if (result.success) {
          setVersions(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [agentId]);

  const handleRevert = (version: AdminAgentDefinition) => {
    if (confirm('Revert to this version? This will create a new version with this content.')) {
      onRevert(version);
    }
  };

  const formatSummary = (version: AdminAgentDefinition): string => {
    const parts = [];
    parts.push(`Model: ${version.model}`);
    if (version.temperature) {
      parts.push(`Temp: ${parseFloat(version.temperature).toFixed(2)}`);
    }
    parts.push(`Tokens: ${version.maxTokens || 16000}`);
    return parts.join(' | ');
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/75 bg-white/90 shadow-[0_16px_32px_-20px_rgba(15,23,42,0.6)] backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Version History</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-600 hover:bg-slate-100">
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <HistorySkeleton />
        ) : versions.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No version history</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {versions.map((version, index) => (
              <li
                key={version.versionId}
                className={`cursor-pointer p-3 transition-colors hover:bg-slate-50 ${
                  selectedVersion?.versionId === version.versionId ? 'bg-sky-50/60' : ''
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {index === 0 && (
                      <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-700">
                        Current
                      </Badge>
                    )}
                    {!version.isActive && (
                      <Badge variant="destructive" className="text-xs bg-rose-100 text-rose-700 border-rose-200">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{formatSummary(version)}</p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                  {version.description || 'No description'}
                </p>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevert(version);
                    }}
                  >
                    Revert to this version
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview Panel */}
      {selectedVersion && (
        <div className="max-h-80 overflow-y-auto border-t border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Preview</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-slate-600 hover:bg-slate-100"
              onClick={() => setSelectedVersion(null)}
            >
              Close
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <h5 className="mb-1 text-xs font-medium text-slate-700">System Prompt</h5>
              <pre className="max-h-32 overflow-y-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs whitespace-pre-wrap text-slate-700">
                {selectedVersion.systemPrompt.slice(0, 500)}
                {selectedVersion.systemPrompt.length > 500 && '...'}
              </pre>
            </div>
            {selectedVersion.userPrompt && (
              <div>
                <h5 className="mb-1 text-xs font-medium text-slate-700">User Prompt</h5>
                <pre className="max-h-24 overflow-y-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs whitespace-pre-wrap text-slate-700">
                  {selectedVersion.userPrompt.slice(0, 300)}
                  {selectedVersion.userPrompt.length > 300 && '...'}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
