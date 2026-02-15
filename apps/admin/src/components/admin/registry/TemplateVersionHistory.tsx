'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VersionEntry {
  content: string;
  createdAt: string;
  evalRubric?: string | null;
}

interface TemplateVersionHistoryProps {
  fetchUrl: string;
  onRevert: (entry: VersionEntry) => void;
  onClose: () => void;
  contentKey?: string;
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

export function TemplateVersionHistory({
  fetchUrl,
  onRevert,
  onClose,
  contentKey = 'content',
}: TemplateVersionHistoryProps) {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const response = await fetch(fetchUrl);
        const result = await response.json();
        if (result.success) {
          // Normalize: map 'template' key to 'content' if needed
          const data = result.data.map((item: Record<string, unknown>) => ({
            content: (item[contentKey] ?? item.template ?? '') as string,
            createdAt: item.createdAt as string,
            evalRubric: (item.evalRubric ?? null) as string | null,
          }));
          setVersions(data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [fetchUrl, contentKey]);

  const handleRevert = (version: VersionEntry) => {
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
                key={version.createdAt}
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
                <p className="text-sm text-gray-600 line-clamp-2">
                  {version.content.slice(0, 100)}
                  {version.content.length > 100 ? '...' : ''}
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
            {selectedVersion.content}
          </pre>
        </div>
      )}
    </div>
  );
}
