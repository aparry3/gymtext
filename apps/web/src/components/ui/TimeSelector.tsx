'use client';

import React from 'react';

interface TimeSelectorProps {
  value: number;
  onChange: (hour: number) => void;
  error?: string;
}

export function TimeSelector({ value, onChange, error }: TimeSelectorProps) {
  // Generate options for 12-hour format
  const timeOptions = React.useMemo(() => {
    const options: { value: number; label: string }[] = [];
    
    // 12 AM
    options.push({ value: 0, label: '12:00 AM' });
    
    // 1 AM - 11 AM
    for (let i = 1; i < 12; i++) {
      options.push({ value: i, label: `${i}:00 AM` });
    }
    
    // 12 PM
    options.push({ value: 12, label: '12:00 PM' });
    
    // 1 PM - 11 PM
    for (let i = 13; i < 24; i++) {
      options.push({ value: i, label: `${i - 12}:00 PM` });
    }
    
    return options;
  }, []);

  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
      >
        {timeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}