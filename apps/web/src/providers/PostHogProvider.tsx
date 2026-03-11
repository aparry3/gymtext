'use client';

/**
 * PostHog Analytics Provider
 *
 * Wraps the app with PostHog for product analytics, session replay,
 * and funnel tracking. Uses EU Cloud for GDPR compliance.
 *
 * Key features:
 * - Auto page views via capture_pageview (Next.js App Router compatible)
 * - Auto page leave tracking for time-on-page metrics
 * - Session recording with masked inputs (PII protection)
 * - Autocapture for click/form events
 * - person_profiles: 'identified_only' — anonymous users tracked without PII profiles
 *
 * Env vars required:
 * - NEXT_PUBLIC_POSTHOG_KEY: PostHog project API key
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog host (defaults to https://t.gymtext.co reverse proxy)
 */

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPostHogConfig } from '@/shared/config/public';

const { key: POSTHOG_KEY, host: POSTHOG_HOST } = getPostHogConfig();

/**
 * Tracks page views on route changes in Next.js App Router.
 * Must be inside <Suspense> because useSearchParams() requires it.
 */
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams.toString();
      if (search) {
        url += '?' + search;
      }
      ph.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PostHog] No NEXT_PUBLIC_POSTHOG_KEY set — analytics disabled');
      }
      return;
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: 'https://us.posthog.com', // For toolbar/debug UI
      person_profiles: 'identified_only',
      capture_pageview: false, // We handle this manually via PostHogPageView
      capture_pageleave: true, // Auto time-on-page tracking
      autocapture: true, // Auto click/input tracking
      session_recording: {
        maskAllInputs: true, // Mask PII in session recordings
        maskTextSelector: '.ph-mask, .sensitive',
      },
      persistence: 'localStorage+cookie',
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          ph.debug();
        }
      },
    });
  }, []);

  if (!POSTHOG_KEY) {
    // No PostHog key — render children without provider
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
