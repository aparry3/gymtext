'use client';

import { useEffect, useState } from 'react';
import { AntPlanPage } from '@/components/pages/me/ant/AntPlanPage';

export default function AntPlanDesignPage() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setMode(mq.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return <AntPlanPage mode={mode} />;
}
