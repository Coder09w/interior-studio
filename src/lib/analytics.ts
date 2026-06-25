/**
 * Instod Analytics — Google Analytics 4 + backward-compatible event helpers.
 *
 * This module is the single source of truth for analytics in the app.
 * It uses GA4 (gtag) loaded via next/script in layout.tsx when
 * NEXT_PUBLIC_GA_ID is set. If the env var is unset, all calls are no-ops —
 * safe to ship in development and on preview branches.
 *
 * The `track*` exports below preserve the original PostHog-style API so
 * existing call sites in signup, dashboard, and InteriorStudio continue to
 * work after the migration from PostHog to GA4.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Internal: fire a GA4 event. Safe to call during SSR — falls back to no-op.
 */
function capture(
  eventName: string,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, properties);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Analytics] Failed to capture ${eventName}:`, err);
    }
  }
}

/**
 * Fire a GA4 event. Public alias of `capture` for new call sites.
 */
export function track(
  action: string,
  params?: Record<string, unknown>
): void {
  capture(action, params as Record<string, string | number | boolean | undefined> | undefined);
}

/**
 * Set the user ID for cross-session attribution. Call after login.
 */
export function identify(userId: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !GA_ID) return;
  window.gtag('config', GA_ID, { user_id: userId, ...params });
}

/**
 * Manually fire a page_view. With App Router + next/script `afterInteractive`,
 * GA4 auto-fires pageviews on initial load. The AnalyticsRouteTracker
 * component handles subsequent client-side navigations.
 */
export function pageview(url: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !GA_ID) return;
  window.gtag('config', GA_ID, { page_path: url });
}

// ─── Backward-compatible event helpers (originally PostHog, now GA4) ────────

/**
 * Fired after successful registration.
 * Maps to GA4 standard `sign_up` event.
 */
export function trackSignUp(properties: { method: string; email_domain: string }) {
  capture('sign_up', {
    method: properties.method,
    email_domain: properties.email_domain,
  });
}

/**
 * Fired after a new project is created.
 */
export function trackProjectCreated(properties: {
  project_id: string;
  project_name: string;
}) {
  capture('project_created', properties);
}

/**
 * Fired after a new room is added to a project.
 */
export function trackRoomCreated(properties: {
  room_name: string;
  room_type: string;
  project_id?: string;
}) {
  capture('room_created', properties);
}

/**
 * Fired when a furniture item is placed in the editor.
 */
export function trackFurnitureAdded(properties: {
  furniture_type: string;
  material_type: string;
  total_items: number;
}) {
  capture('furniture_added', properties);
}

/**
 * Fired when a user explicitly saves a design (not auto-saves).
 */
export function trackDesignSaved(properties: {
  room_id: string;
  item_count: number;
  has_cloud_save: boolean;
}) {
  capture('design_saved', properties);
}

/**
 * Fired when a user opens a project from the dashboard.
 */
export function trackProjectOpened(properties: {
  project_id: string;
  project_name: string;
  room_count: number;
}) {
  capture('project_opened', properties);
}

/**
 * Standard event names used across the app. Keep this list curated —
 * investors and product reviews will look at GA event flow.
 */
export const events = {
  // Auth
  signUp: (method: 'email' | 'google' = 'email') => track('sign_up', { method }),
  signIn: (method: 'email' | 'google' = 'email') => track('login', { method }),

  // Editor
  editorOpened: (roomType?: string) =>
    track('editor_opened', roomType ? { room_type: roomType } : undefined),
  shareLinkCreated: (projectId: string) =>
    track('share_link_created', { project_id: projectId }),
  screenshotExported: (projectId: string) =>
    track('screenshot_exported', { project_id: projectId }),
  focusModeToggled: (enabled: boolean) =>
    track('focus_mode_toggled', { enabled }),

  // Conversion
  pricingViewed: () => track('pricing_viewed'),
  ctaClicked: (location: string) => track('cta_clicked', { location }),
  contactSubmitted: (subject: string) =>
    track('contact_submitted', { subject }),

  // Engagement
  feedbackSubmitted: () => track('feedback_submitted'),
} as const;
