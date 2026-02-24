'use client';

import { Card } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface ConditioningCardProps {
  guidelines?: string[];
  isLoading?: boolean;
}

export function ConditioningCard({ guidelines = [], isLoading = false }: ConditioningCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 bg-green-50 border-green-200 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-green-200/50 rounded" />
          <div className="h-5 w-40 bg-green-200/50 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-2 w-2 bg-green-200/50 rounded-full mt-2" />
              <div className="h-4 w-full bg-green-200/50 rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (guidelines.length === 0) {
    return null;
  }

  return (
    <Card className="p-5 bg-green-50 border-green-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-green-800">Conditioning Guidelines</h3>
      </div>
      <ul className="space-y-3">
        {guidelines.map((guideline, index) => (
          <li key={index} className="flex gap-3 text-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-600 mt-2" />
            <span className="text-green-700 leading-relaxed">{guideline}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
