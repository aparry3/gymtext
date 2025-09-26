'use client'

import { useEffect } from 'react'

const ANALYTICS_WRITE_KEY = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY

export function useAnalytics() {
  const track = (event: string, properties: Record<string, unknown> = {}) => {
    if (!ANALYTICS_WRITE_KEY) {
      // Development mode - just log to console
      console.log('Analytics Event:', { event, properties })
      return
    }

    // In production, you would send to your analytics service
    // Example with a generic analytics API:
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      })
    }).catch(err => {
      console.error('Analytics tracking error:', err)
    })
  }

  const pageView = (pageName: string, properties: Record<string, unknown> = {}) => {
    track('page_viewed', {
      page: pageName,
      ...properties
    })
  }

  return {
    track,
    pageView
  }
}

export function usePageView(pageName: string, properties: Record<string, unknown> = {}) {
  const { pageView } = useAnalytics()

  useEffect(() => {
    pageView(pageName, properties)
  }, [pageName, pageView, properties])
}