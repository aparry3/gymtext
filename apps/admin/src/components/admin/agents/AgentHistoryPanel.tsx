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
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
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
    <div className="h-full flex flex-col bg-white rounded-lg border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
        <h3 className="font-semibold text-sm">Version History</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <HistorySkeleton />
        ) : versions.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No version history</p>
        ) : (
          <ul className="divide-y">
            {versions.map((version, index) => (
              <li
                key={version.versionId}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedVersion?.versionId === version.versionId ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {!version.isActive && (
                      <Badge variant="destructive" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{formatSummary(version)}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {version.description || 'No description'}
                </p>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
        <div className="border-t p-4 max-h-80 overflow-y-auto bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setSelectedVersion(null)}
            >
              Close
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-1">System Prompt</h5>
              <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                {selectedVersion.systemPrompt.slice(0, 500)}
                {selectedVersion.systemPrompt.length > 500 && '...'}
              </pre>
            </div>
            {selectedVersion.userPrompt && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-1">User Prompt</h5>
                <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 bg-white p-3 rounded border max-h-24 overflow-y-auto">
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
