'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Prompt } from './types';

interface VersionHistoryPanelProps {
  agentId: string;
  onRevert: (version: Prompt) => void;
  onClose: () => void;
}

// All prompts on this page are context prompts
const ROLE = 'context' as const;

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

export function VersionHistoryPanel({
  agentId,
  onRevert,
  onClose,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Prompt | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/prompts/${agentId}/${ROLE}/history?limit=20`);
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

  const handleRevert = (version: Prompt) => {
    if (confirm('Revert to this version? This will create a new version with this content.')) {
      onRevert(version);
    }
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
                key={`${version.createdAt}`}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedVersion?.createdAt === version.createdAt ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{version.value.slice(0, 100)}...</p>
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
        <div className="border-t p-4 max-h-64 overflow-y-auto bg-gray-50">
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
          <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 bg-white p-3 rounded border max-h-48 overflow-y-auto">
            {selectedVersion.value}
          </pre>
        </div>
      )}
    </div>
  );
}
