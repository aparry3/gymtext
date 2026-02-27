'use client';

import { usePathname } from 'next/navigation';

export function MeContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = pathname.startsWith('/me/workouts/');

  return (
    <div className={isFullscreen ? '' : 'md:pl-64'}>
      {!isFullscreen && <div className="h-16 md:h-0" />}
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
