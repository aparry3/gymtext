'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type PromptRole, ROLE_LABELS } from './types';

interface RoleTabsProps {
  availableRoles: PromptRole[];
  selectedRole: PromptRole;
  onRoleChange: (role: PromptRole) => void;
}

export function RoleTabs({ availableRoles, selectedRole, onRoleChange }: RoleTabsProps) {
  if (availableRoles.length <= 1) {
    return null;
  }

  return (
    <Tabs value={selectedRole} onValueChange={(v) => onRoleChange(v as PromptRole)}>
      <TabsList className="mb-4">
        {availableRoles.map((role) => (
          <TabsTrigger key={role} value={role}>
            {ROLE_LABELS[role]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
