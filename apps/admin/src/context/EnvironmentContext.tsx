'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';

type EnvironmentMode = 'production' | 'sandbox';

interface EnvironmentContextValue {
  mode: EnvironmentMode;
  setMode: (mode: EnvironmentMode) => void;
  isProduction: boolean;
  isSandbox: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export function EnvironmentProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode: EnvironmentMode;
}) {
  const [mode, setModeState] = useState<EnvironmentMode>(initialMode);

  const setMode = useCallback((newMode: EnvironmentMode) => {
    setModeState(newMode);
    Cookies.set('gt_env', newMode, {
      expires: 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        mode,
        setMode,
        isProduction: mode === 'production',
        isSandbox: mode === 'sandbox',
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within EnvironmentProvider');
  }
  return context;
}
