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

export const PROMPT_DOMAINS: PromptDomain[] = [
  {
    id: 'chat',
    label: 'Chat',
    agents: [{ id: 'chat:generate', label: 'Chat Agent', roles: ['system'] }],
  },
  {
    id: 'profile',
    label: 'Profile',
    agents: [
      { id: 'profile:fitness', label: 'Fitness Profile', roles: ['system', 'user'] },
      { id: 'profile:structured', label: 'Structured Profile', roles: ['system', 'user'] },
      { id: 'profile:user', label: 'User Fields', roles: ['system', 'user'] },
    ],
  },
  {
    id: 'plan',
    label: 'Fitness Plans',
    agents: [
      { id: 'plan:generate', label: 'Plan Generator', roles: ['system', 'user'] },
      { id: 'plan:structured', label: 'Structured Plan', roles: ['system', 'user'] },
      { id: 'plan:message', label: 'Plan Message', roles: ['system', 'user'] },
      { id: 'plan:modify', label: 'Modify Plan', roles: ['system'] },
    ],
  },
  {
    id: 'microcycle',
    label: 'Microcycles',
    agents: [
      { id: 'microcycle:generate', label: 'Microcycle Generator', roles: ['system', 'user'] },
      { id: 'microcycle:structured', label: 'Structured Microcycle', roles: ['system', 'user'] },
      { id: 'microcycle:message', label: 'Microcycle Message', roles: ['system', 'user'] },
      { id: 'microcycle:modify', label: 'Modify Microcycle', roles: ['system'] },
    ],
  },
  {
    id: 'workout',
    label: 'Workouts',
    agents: [
      { id: 'workout:generate', label: 'Workout Generator', roles: ['system', 'user'] },
      { id: 'workout:structured', label: 'Structured Workout', roles: ['system', 'user'] },
      { id: 'workout:message', label: 'Workout Message', roles: ['system', 'user'] },
      { id: 'workout:modify', label: 'Modify Workout', roles: ['system', 'user'] },
      { id: 'workout:message:format:training', label: 'Training Format', roles: ['context'] },
      {
        id: 'workout:message:format:active_recovery',
        label: 'Active Recovery Format',
        roles: ['context'],
      },
      { id: 'workout:message:format:rest', label: 'Rest Format', roles: ['context'] },
    ],
  },
  {
    id: 'modifications',
    label: 'Modifications',
    agents: [
      { id: 'modifications:router', label: 'Modifications Router', roles: ['system', 'user'] },
    ],
  },
];

export const ROLE_LABELS: Record<PromptRole, string> = {
  system: 'System',
  user: 'User',
  context: 'Context',
};
