import type { PromptRole, Prompt } from '@/server/models/prompt';

export type { PromptRole, Prompt };

export interface PromptDomain {
  id: string;
  label: string;
  agents: AgentConfig[];
}

export interface AgentConfig {
  id: string;
  label: string;
  roles: PromptRole[];
}

export interface SelectedPrompt {
  agentId: string;
  availableRoles: PromptRole[];
}

// Context-only prompts - system/user prompts are managed in /agent-configs
export const PROMPT_DOMAINS: PromptDomain[] = [
  {
    id: 'microcycle',
    label: 'Microcycles',
    agents: [
      { id: 'microcycle:generate:experience:beginner', label: 'Beginner Experience', roles: ['context'] },
      { id: 'microcycle:generate:experience:intermediate', label: 'Intermediate Experience', roles: ['context'] },
      { id: 'microcycle:generate:experience:advanced', label: 'Advanced Experience', roles: ['context'] },
    ],
  },
  {
    id: 'workout',
    label: 'Workouts',
    agents: [
      { id: 'workout:generate:experience:beginner', label: 'Beginner Experience', roles: ['context'] },
      { id: 'workout:generate:experience:intermediate', label: 'Intermediate Experience', roles: ['context'] },
      { id: 'workout:generate:experience:advanced', label: 'Advanced Experience', roles: ['context'] },
      { id: 'workout:message:format:training', label: 'Training Format', roles: ['context'] },
      { id: 'workout:message:format:active_recovery', label: 'Active Recovery Format', roles: ['context'] },
      { id: 'workout:message:format:rest', label: 'Rest Format', roles: ['context'] },
    ],
  },
];

export const ROLE_LABELS: Record<PromptRole, string> = {
  system: 'System',
  user: 'User',
  context: 'Context',
};
