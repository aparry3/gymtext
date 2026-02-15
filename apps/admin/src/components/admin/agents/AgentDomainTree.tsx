'use client';

import { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { AGENT_DOMAINS, type AdminAgentDefinition } from './types';

interface AgentDomainTreeProps {
  onSelect: (agentId: string) => void;
  selectedAgentId?: string;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        'h-3 w-3 shrink-0 text-slate-400 transition-transform duration-200',
        expanded && 'rotate-90'
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function AgentDomainTree({ onSelect, selectedAgentId }: AgentDomainTreeProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(() => {
    // Start with all domains expanded
    return new Set(AGENT_DOMAINS.map((d) => d.id));
  });

  // Track which agents exist in the database
  const [existingAgents, setExistingAgents] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing agents on mount
  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('/api/agent-definitions');
        const result = await response.json();
        if (result.success) {
          const agentIds = new Set<string>(result.data.map((d: AdminAgentDefinition) => d.agentId));
          setExistingAgents(agentIds);
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  };

  return (
    <nav className="space-y-1 p-3">
      <h3 className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        Agent Domains
      </h3>
      {AGENT_DOMAINS.map((domain) => {
        const existingCount = domain.agents.filter((a) => existingAgents.has(a.id)).length;
        const isExpanded = expandedDomains.has(domain.id);

        return (
          <Collapsible
            key={domain.id}
            open={isExpanded}
            onOpenChange={() => toggleDomain(domain.id)}
          >
            <CollapsibleTrigger className="flex w-full items-center rounded-xl px-2 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80">
              <ChevronIcon expanded={isExpanded} />
              <span className="ml-1">{domain.label}</span>
              <span className="ml-auto text-xs text-slate-400">
                {isLoading ? '...' : `${existingCount}/${domain.agents.length}`}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1 ml-4 space-y-0.5 border-l border-slate-200 pl-2">
                {domain.agents.map((agent) => {
                  const exists = existingAgents.has(agent.id);
                  const isSelected = selectedAgentId === agent.id;

                  return (
                    <li key={agent.id}>
                      <button
                        onClick={() => exists && onSelect(agent.id)}
                        disabled={!exists}
                        className={cn(
                          'w-full rounded-lg px-2 py-1 text-left text-sm transition-colors',
                          exists ? 'text-slate-700 hover:bg-slate-100/80' : 'cursor-not-allowed text-slate-400',
                          isSelected && 'bg-sky-100/70 text-sky-800 font-medium hover:bg-sky-100'
                        )}
                      >
                        {agent.label}
                        {!exists && (
                          <span className="ml-1 text-xs text-slate-400">(not seeded)</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
