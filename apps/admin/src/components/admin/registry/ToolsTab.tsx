'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToolParameterDisplay } from './ToolParameterDisplay';

interface DetailedToolMetadata {
  name: string;
  description: string;
  priority?: number;
  parameters: Record<string, unknown>;
}

function ToolsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse border rounded-lg p-4">
          <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ToolsTab() {
  const [tools, setTools] = useState<DetailedToolMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTools() {
      try {
        const response = await fetch('/api/registry/tools');
        const result = await response.json();
        if (result.success) {
          setTools(result.data);
        } else {
          setError(result.message || 'Failed to load tools');
        }
      } catch (err) {
        setError('Failed to load tools');
        console.error('Failed to fetch tools:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTools();
  }, []);

  if (isLoading) return <ToolsSkeleton />;
  if (error) {
    return <div className="text-sm text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="space-y-3">
      {tools.map((tool) => (
        <Card key={tool.name} className="overflow-hidden">
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            onClick={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium">{tool.name}</span>
              {tool.priority != null && (
                <Badge variant="outline" className="text-xs">
                  priority: {tool.priority}
                </Badge>
              )}
            </div>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${expandedTool === tool.name ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedTool === tool.name && (
            <div className="px-4 pb-4 border-t bg-gray-50/30">
              <p className="text-sm text-gray-600 mt-3 mb-4">{tool.description}</p>
              <ToolParameterDisplay parameters={tool.parameters as { type?: string; properties?: Record<string, { type?: string; description?: string; enum?: string[]; items?: { type?: string }; default?: unknown }>; required?: string[] }} />
            </div>
          )}
        </Card>
      ))}
      {tools.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">No tools registered</p>
      )}
    </div>
  );
}
