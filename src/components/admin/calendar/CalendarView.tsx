'use client';

import { useState, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { DayConfigModal } from './DayConfigModal';
import { Button } from '@/components/ui/button';
import 'react-day-picker/style.css';

interface DayConfigData {
  id: string;
  date: string;
  config: {
    imageUrl?: string;
    imageName?: string;
  };
}

interface CalendarViewState {
  currentMonth: Date;
  configs: DayConfigData[];
  selectedDate: Date | null;
  isLoading: boolean;
  error: string | null;
}

export function CalendarView() {
  const [state, setState] = useState<CalendarViewState>({
    currentMonth: startOfMonth(new Date()),
    configs: [],
    selectedDate: null,
    isLoading: true,
    error: null,
  });

  const fetchConfigs = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const year = state.currentMonth.getFullYear();
    const month = state.currentMonth.getMonth() + 1;

    try {
      const res = await fetch(`/api/admin/calendar?year=${year}&month=${month}`);
      const data = await res.json();

      if (data.success) {
        setState((s) => ({
          ...s,
          configs: data.data.configs,
          isLoading: false,
        }));
      } else {
        setState((s) => ({
          ...s,
          error: data.message || 'Failed to load configs',
          isLoading: false,
        }));
      }
    } catch {
      setState((s) => ({
        ...s,
        error: 'Failed to load configs',
        isLoading: false,
      }));
    }
  }, [state.currentMonth]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleDayClick = (date: Date) => {
    setState((s) => ({ ...s, selectedDate: date }));
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setState((s) => ({
      ...s,
      currentMonth:
        direction === 'prev'
          ? subMonths(s.currentMonth, 1)
          : addMonths(s.currentMonth, 1),
    }));
  };

  const handleModalClose = () => {
    setState((s) => ({ ...s, selectedDate: null }));
    fetchConfigs();
  };

  // Get dates that have image configs
  const configuredDates = state.configs
    .filter((c) => c.config?.imageUrl)
    .map((c) => new Date(c.date + 'T12:00:00'));

  // Find config for selected date
  const selectedConfig = state.selectedDate
    ? state.configs.find(
        (c) =>
          format(new Date(c.date + 'T12:00:00'), 'yyyy-MM-dd') ===
          format(state.selectedDate!, 'yyyy-MM-dd')
      )
    : undefined;

  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Custom header with month navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {format(state.currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange('prev')}
              disabled={state.isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState((s) => ({ ...s, currentMonth: startOfMonth(new Date()) }))}
              disabled={state.isLoading}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthChange('next')}
              disabled={state.isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {state.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        {/* Calendar */}
        <DayPicker
          mode="single"
          selected={undefined}
          month={state.currentMonth}
          onMonthChange={(month) => setState((s) => ({ ...s, currentMonth: month }))}
          onDayClick={handleDayClick}
          modifiers={{
            hasImage: configuredDates,
          }}
          modifiersClassNames={{
            hasImage: 'has-image-day',
          }}
          disabled={state.isLoading}
          classNames={{
            root: 'w-full',
            months: 'w-full',
            month: 'w-full',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex w-full',
            weekday: 'flex-1 text-center text-sm font-medium text-gray-500 py-2',
            week: 'flex w-full',
            day: 'flex-1 aspect-square p-1',
            day_button:
              'w-full h-full flex flex-col items-center justify-center rounded-lg text-sm hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-50',
            selected: '',
            today: 'font-bold',
            outside: 'text-gray-300',
            hidden: 'invisible',
            nav: 'hidden', // Hide default nav, we use custom
            caption: 'hidden', // Hide default caption, we use custom
          }}
          components={{
            DayButton: ({ day, modifiers, ...props }) => {
              const hasImage = modifiers.hasImage;
              // day is a CalendarDay object with a .date property
              const dateNumber = day.date.getDate();
              return (
                <button
                  {...props}
                  className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer
                    ${modifiers.today ? 'font-bold ring-2 ring-primary/30' : ''}
                    ${modifiers.outside ? 'text-gray-300' : ''}
                    ${hasImage ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-gray-100'}
                  `}
                >
                  <span>{dateNumber}</span>
                  {hasImage && (
                    <ImageIcon className="w-3 h-3 mt-0.5 text-green-600" />
                  )}
                </button>
              );
            },
          }}
        />

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 flex items-center justify-center">
              <ImageIcon className="w-2.5 h-2.5 text-green-600" />
            </div>
            <span>Has custom image</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-primary/30" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Modal for editing day config */}
      {state.selectedDate && (
        <DayConfigModal
          date={state.selectedDate}
          config={selectedConfig}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
