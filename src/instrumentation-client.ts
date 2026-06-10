// PostHog client-side initialization
// This file is automatically loaded by Next.js 15.3+ on the client side
// before hydration, making PostHog available immediately.
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (token) {
    // Check cookie consent before enabling capture
    let optOutByDefault = false
    try {
      const consent = localStorage.getItem('instod_cookie_consent')
      if (consent === 'rejected') {
        optOutByDefault = true
      }
    } catch {
      // localStorage not available yet
    }

    posthog.init(token, {
      api_host: host || 'https://us.i.posthog.com',
      defaults: '2026-01-30',
      // Respect cookie consent — opt out by default if user rejected
      opt_out_capturing_by_default: optOutByDefault,
      // Disable session recording for now (can enable later)
      disable_session_recording: true,
      // Respect Do Not Track browser setting
      respect_dnt: true,
      // Use memory-only persistence if user rejected cookies
      persistence: optOutByDefault ? 'memory' : 'localStorage+cookie',
    })

    if (process.env.NODE_ENV === 'development') {
      console.info('[PostHog] Initialized successfully')
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN not set — analytics disabled')
  }
}
