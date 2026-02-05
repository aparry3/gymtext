'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AgentConfig } from './types';

interface AgentConfigListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AgentConfigList({ selectedId, onSelect }: AgentConfigListProps) {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfigs() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/agent-configs');
        const result = await response.json();

        if (result.success) {
          // Convert createdAt strings to Date objects
          const configsWithDates = result.data.map((c: AgentConfig) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          }));
          setConfigs(configsWithDates);
        } else {
          setError(result.message || 'Failed to load configs');
        }
      } catch (err) {
        setError('Failed to fetch agent configs');
        console.error('Failed to fetch agent configs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfigs();
  }, []);

  // Group configs by domain (prefix before colon)
  const groupedConfigs = configs.reduce<Record<string, AgentConfig[]>>((acc, config) => {
    const domain = config.id.split(':')[0] || 'other';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(config);
    return acc;
  }, {});

  const domainLabels: Record<string, string> = {
    chat: 'Chat',
    profile: 'Profile',
    plan: 'Fitness Plans',
    microcycle: 'Microcycles',
    workout: 'Workouts',
    modifications: 'Modifications',
    program: 'Programs',
    other: 'Other',
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No agent configs found. Run the migration to seed configs.
      </div>
    );
  }

  return (
    <div className="p-2">
      {Object.entries(groupedConfigs).map(([domain, domainConfigs]) => (
        <div key={domain} className="mb-4">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {domainLabels[domain] || domain}
          </h3>
          <div className="space-y-1">
            {domainConfigs.map((config) => (
              <button
                key={config.id}
                onClick={() => onSelect(config.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedId === config.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{config.id}</span>
                  {config.model && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {config.model.replace('gpt-', '').replace('gemini-', 'gem-')}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
