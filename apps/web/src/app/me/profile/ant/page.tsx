'use client';

import { useEffect, useState } from 'react';
import { AntProfilePage } from '@/components/pages/me/ant/AntProfilePage';

export default function AntProfileDesignPage() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setMode(mq.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return <AntProfilePage mode={mode} />;
}
