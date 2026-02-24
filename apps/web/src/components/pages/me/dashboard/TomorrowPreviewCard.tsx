'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, Moon, Clock } from 'lucide-react';

interface TomorrowPreviewCardProps {
  title?: string;
  focus?: string;
  isRestDay?: boolean;
  isLoading?: boolean;
  estimatedDuration?: number;
  mainMovements?: string[];
}

export function TomorrowPreviewCard({
  title,
  focus,
  isRestDay = false,
  isLoading = false,
  estimatedDuration,
  mainMovements,
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

  // Show up to 2 main movements as compact preview
  const movementPreview = mainMovements?.slice(0, 2);

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 text-slate-400 mb-3">
        <Calendar className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Tomorrow</span>
      </div>

      <h3 className="text-lg font-bold text-white mb-1">
        {title || 'Workout'}
      </h3>

      <div className="flex items-center gap-2 mb-2">
        {focus && (
          <Badge
            variant="outline"
            className="text-blue-400 border-blue-400/50"
          >
            {focus}
          </Badge>
        )}
        {estimatedDuration && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            ~{estimatedDuration} min
          </span>
        )}
      </div>

      {movementPreview && movementPreview.length > 0 && (
        <p className="text-sm text-slate-400 line-clamp-2">
          {movementPreview.join(' \u00B7 ')}
        </p>
      )}
    </div>
  );
}
