'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { ProgramOwner } from '@gymtext/shared/server';

interface OwnerContextValue {
  owner: ProgramOwner;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({
  children,
  owner,
}: {
  children: ReactNode;
  owner: ProgramOwner;
}) {
  return (
    <OwnerContext.Provider value={{ owner }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within OwnerProvider');
  }
  return context;
}
