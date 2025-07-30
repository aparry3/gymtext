'use client';

import React from 'react';
import { COMMON_TIMEZONES, formatTimezoneForDisplay } from '@/shared/utils/timezone';

interface TimezoneDisplayProps {
  value: string;
  onChange?: (timezone: string) => void;
  readonly?: boolean;
  error?: string;
}

export function TimezoneDisplay({ value, onChange, readonly = false, error }: TimezoneDisplayProps) {
  if (readonly) {
    return (
      <div className="px-4 py-3 rounded-md bg-gray-50 text-[#2d3748] border border-gray-200">
        <span className="font-medium">{formatTimezoneForDisplay(value)}</span>
        <span className="text-sm text-gray-500 ml-2">({value})</span>
      </div>
    );
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
      >
        <optgroup label="Common Timezones">
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {formatTimezoneForDisplay(tz)}
            </option>
          ))}
        </optgroup>
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}