'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AgentConfig } from './types';

interface AgentConfigHistoryPanelProps {
  agentId: string;
  onRevert: (version: AgentConfig) => void;
  onClose: () => void;
  refreshKey?: number;
}

export function AgentConfigHistoryPanel({
  agentId,
  onRevert,
  onClose,
  refreshKey = 0,
}: AgentConfigHistoryPanelProps) {
  const [history, setHistory] = useState<AgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/agent-configs/${encodeURIComponent(agentId)}/history?limit=20`
        );
        const result = await response.json();

        if (result.success) {
          const historyWithDates = result.data.map((h: AgentConfig) => ({
            ...h,
            createdAt: new Date(h.createdAt),
          }));
          setHistory(historyWithDates);
        } else {
          setError(result.message || 'Failed to load history');
        }
      } catch (err) {
        setError('Failed to fetch history');
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [agentId, refreshKey]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-80 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
        <h3 className="font-medium text-sm">Version History</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 text-sm">{error}</div>
        ) : history.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center">No version history</div>
        ) : (
          <div className="divide-y">
            {history.map((version, index) => (
              <div
                key={version.createdAt.toISOString()}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(version.createdAt)}
                      </span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {version.model && (
                        <Badge variant="secondary" className="text-xs">
                          {version.model}
                        </Badge>
                      )}
                      {version.temperature !== null && (
                        <Badge variant="secondary" className="text-xs">
                          temp: {version.temperature}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {version.systemPrompt.substring(0, 100)}
                      {version.systemPrompt.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => onRevert(version)}
                    >
                      Revert
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
