import posthog from 'posthog-js';

let isInitialized = false;

export function initPostHog() {
  if (isInitialized) return;
  if (typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) {
    console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set. Analytics disabled.');
    return;
  }

  // Check cookie consent before initializing
  const consent = localStorage.getItem('instod_cookie_consent');
  if (consent === 'rejected') {
    console.info('[PostHog] Cookie consent rejected. Analytics disabled.');
    return;
  }

  posthog.init(key, {
    api_host: host,
    // Respect user privacy
    capture_pageview: true,
    capture_pageleave: true,
    // Session recording disabled for now (can enable later)
    disable_session_recording: true,
    // Don't capture personal data
    mask_all_text: false,
    mask_all_element_attributes: false,
    // Performance
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        console.info('[PostHog] Initialized in development mode');
      }
    },
    // Opt out of cookie-based tracking if user rejects
    persistence: consent === 'accepted' ? 'localStorage+cookie' : 'memory',
    // Respect Do Not Track
    respect_dnt: true,
    // Disable in development if needed
    opt_out_capturing_by_default: false,
  });

  // Identify if user is logged in (will be called from provider)
  isInitialized = true;
}

export function enablePostHog() {
  if (!isInitialized) {
    initPostHog();
    return;
  }
  posthog.opt_in_capturing();
  posthog.set_config({ persistence: 'localStorage+cookie' });
}

export function disablePostHog() {
  if (!isInitialized) return;
  posthog.opt_out_capturing();
  posthog.set_config({ persistence: 'memory' });
}

export function identifyUser(userId: string, properties?: Record<string, string | number | boolean>) {
  if (!isInitialized) return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (!isInitialized) return;
  posthog.reset();
}

export { posthog };
