'use client';

import { Badge } from '@/components/ui/badge';

interface MeHeaderProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    weekNumber?: number;
  };
}

export function MeHeader({ title, subtitle, status }: MeHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {status && (
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
            Status
          </span>
          <Badge
            variant="outline"
            className="border-blue-500/30 text-blue-400 bg-blue-500/10"
          >
            {status.label}
            {status.weekNumber !== undefined && ` • Week ${status.weekNumber}`}
          </Badge>
        </div>
      )}
    </div>
  );
}
