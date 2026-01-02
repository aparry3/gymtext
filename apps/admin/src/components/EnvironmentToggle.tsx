'use client';

import { useEnvironment } from '@/context/EnvironmentContext';

export function EnvironmentToggle() {
  const { mode, setMode, isProduction, isSandbox } = useEnvironment();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
      <button
        onClick={() => setMode('production')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          isProduction
            ? 'bg-green-600 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Production
      </button>
      <button
        onClick={() => setMode('sandbox')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          isSandbox
            ? 'bg-amber-500 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        Sandbox
      </button>
    </div>
  );
}

/**
 * Environment indicator badge (shows current mode)
 */
export function EnvironmentBadge() {
  const { mode, isProduction } = useEnvironment();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isProduction
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      }`}
    >
      {mode.charAt(0).toUpperCase() + mode.slice(1)}
    </span>
  );
}
