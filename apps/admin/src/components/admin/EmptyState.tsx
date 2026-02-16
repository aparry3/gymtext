'use client';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.05]">
      <div className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
        )}
        {action}
      </div>
    </div>
  );
}
