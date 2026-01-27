'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, Moon } from 'lucide-react';

interface TomorrowPreviewCardProps {
  title?: string;
  focus?: string;
  description?: string;
  isRestDay?: boolean;
  isLoading?: boolean;
}

export function TomorrowPreviewCard({
  title,
  focus,
  description,
  isRestDay = false,
  isLoading = false,
}: TomorrowPreviewCardProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-slate-800 rounded" />
          <div className="h-3 w-20 bg-slate-800 rounded" />
        </div>
        <div className="h-5 w-32 bg-slate-800 rounded mb-2" />
        <div className="h-4 w-16 bg-slate-800 rounded mb-2" />
        <div className="h-3 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  if (isRestDay) {
    return (
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <Moon className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Tomorrow</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Rest Day</h3>
        <p className="text-sm text-slate-400">
          Recovery and light activity scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 text-slate-400 mb-3">
        <Calendar className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Tomorrow</span>
      </div>

      <h3 className="text-lg font-bold text-white mb-1">
        {title || 'Workout'}
      </h3>

      {focus && (
        <Badge
          variant="outline"
          className="text-blue-400 border-blue-400/50 mb-2"
        >
          {focus}
        </Badge>
      )}

      {description && (
        <p className="text-sm text-slate-400 line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
}
