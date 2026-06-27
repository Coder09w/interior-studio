'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GA_ID, pageview } from '@/lib/analytics';

/**
 * Fires a GA4 page_view on every client-side route change in the App Router.
 *
 * GA4 auto-fires on initial load via the gtag script in layout.tsx, but
 * client-side navigations in Next.js App Router don't trigger a new
 * pageview unless we manually call `gtag('config', GA_ID, { page_path })`.
 *
 * This component is rendered once inside RootLayout. It does not render
 * any UI — it's a side-effect-only subscriber.
 *
 * If NEXT_PUBLIC_GA_ID is unset, pageview() is a no-op, so this is safe
 * to ship in all environments.
 *
 * Note: We intentionally do NOT use `useSearchParams` here — doing so
 * would force every statically-prerendered page (e.g. /auth/forgot-password)
 * to bail out of static generation. UTM tags are still captured by GA4
 * on the initial page load via the gtag config.
 */
export function AnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_ID) return;
    pageview(pathname);
  }, [pathname]);

  return null;
}
