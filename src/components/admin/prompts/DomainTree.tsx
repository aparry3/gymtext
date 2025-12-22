'use client';

import { useState, useMemo } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { PROMPT_DOMAINS, type PromptRole, type AgentConfig } from './types';

interface DomainTreeProps {
  onSelect: (agentId: string, roles: PromptRole[]) => void;
  selectedAgentId?: string;
}

interface TreeNode {
  segment: string;
  fullId?: string;
  roles?: PromptRole[];
  children: TreeNode[];
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn(
        'h-3 w-3 shrink-0 text-gray-400 transition-transform duration-200',
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

/**
 * Build a tree structure from flat agent configs based on colon-separated IDs
 */
function buildTree(agents: AgentConfig[], domainId: string): TreeNode[] {
  const root: TreeNode[] = [];

  for (const agent of agents) {
    // Remove domain prefix and split by colon
    const idWithoutDomain = agent.id.startsWith(domainId + ':')
      ? agent.id.slice(domainId.length + 1)
      : agent.id;
    const segments = idWithoutDomain.split(':');

    let currentLevel = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLeaf = i === segments.length - 1;

      // Find existing node at this level
      let node = currentLevel.find((n) => n.segment === segment);

      if (!node) {
        node = {
          segment,
          children: [],
        };
        currentLevel.push(node);
      }

      // If this is the leaf (actual prompt), add the full ID and roles
      if (isLeaf) {
        node.fullId = agent.id;
        node.roles = agent.roles;
      }

      currentLevel = node.children;
    }
  }

  return root;
}

/**
 * Recursive component to render tree nodes
 */
function TreeNodeComponent({
  node,
  depth,
  onSelect,
  selectedAgentId,
  expandedNodes,
  toggleNode,
}: {
  node: TreeNode;
  depth: number;
  onSelect: (agentId: string, roles: PromptRole[]) => void;
  selectedAgentId?: string;
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isLeaf = node.fullId && node.roles;
  const nodeKey = node.fullId || node.segment;
  const isExpanded = expandedNodes.has(nodeKey);
  const isSelected = selectedAgentId === node.fullId;

  // If it's a leaf node (selectable prompt)
  if (isLeaf && !hasChildren) {
    return (
      <li>
        <button
          onClick={() => onSelect(node.fullId!, node.roles!)}
          className={cn(
            'w-full text-left px-2 py-1 text-sm rounded-lg transition-colors',
            'hover:bg-gray-100',
            isSelected && 'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100'
          )}
        >
          {node.segment}
        </button>
      </li>
    );
  }

  // If it's a branch node (has children) - could also be selectable
  if (hasChildren) {
    return (
      <li>
        <Collapsible open={isExpanded} onOpenChange={() => toggleNode(nodeKey)}>
          <div className="flex items-center">
            <CollapsibleTrigger className="flex items-center gap-1 px-2 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <ChevronIcon expanded={isExpanded} />
              <span>{node.segment}</span>
            </CollapsibleTrigger>
            {/* If this node is also a selectable prompt */}
            {isLeaf && (
              <button
                onClick={() => onSelect(node.fullId!, node.roles!)}
                className={cn(
                  'ml-1 px-1.5 py-0.5 text-xs rounded transition-colors',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  isSelected && 'bg-blue-100 text-blue-700'
                )}
                title="Edit this prompt"
              >
                edit
              </button>
            )}
          </div>
          <CollapsibleContent>
            <ul className="ml-3 border-l border-gray-200 pl-2 space-y-0.5 mt-0.5">
              {node.children.map((child) => (
                <TreeNodeComponent
                  key={child.fullId || child.segment}
                  node={child}
                  depth={depth + 1}
                  onSelect={onSelect}
                  selectedAgentId={selectedAgentId}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  // Fallback for non-leaf, non-branch (shouldn't happen)
  return null;
}

export function DomainTree({ onSelect, selectedAgentId }: DomainTreeProps) {
  // Build trees for each domain (memoized)
  const domainTrees = useMemo(() => {
    return PROMPT_DOMAINS.map((domain) => ({
      ...domain,
      tree: buildTree(domain.agents, domain.id),
    }));
  }, []);

  // Track expanded state for domains and tree nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Start with all domains expanded
    const initial = new Set<string>();
    PROMPT_DOMAINS.forEach((d) => initial.add(d.id));
    return initial;
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Count total prompts in a domain
  const countPrompts = (agents: AgentConfig[]) => agents.length;

  return (
    <nav className="p-3 space-y-1">
      <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Domains
      </h3>
      {domainTrees.map((domain) => (
        <Collapsible
          key={domain.id}
          open={expandedNodes.has(domain.id)}
          onOpenChange={() => toggleNode(domain.id)}
        >
          <CollapsibleTrigger className="flex items-center w-full px-2 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronIcon expanded={expandedNodes.has(domain.id)} />
            <span className="ml-1">{domain.label}</span>
            <span className="ml-auto text-xs text-gray-400">{countPrompts(domain.agents)}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="ml-4 border-l border-gray-200 pl-2 space-y-0.5 mt-1">
              {domain.tree.map((node) => (
                <TreeNodeComponent
                  key={node.fullId || node.segment}
                  node={node}
                  depth={0}
                  onSelect={onSelect}
                  selectedAgentId={selectedAgentId}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </nav>
  );
}
