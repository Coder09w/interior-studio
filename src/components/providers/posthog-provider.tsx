'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { initPostHog, identifyUser, resetUser } from '@/lib/posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Initialize PostHog on mount (respects cookie consent inside initPostHog)
    initPostHog();
  }, []);

  useEffect(() => {
    // Identify or reset user based on session state
    if (status === 'authenticated' && session?.user) {
      identifyUser(session.user.id!, {
        email: session.user.email || '',
        name: session.user.name || '',
        plan: (session.user as Record<string, unknown>).plan as string || 'free',
      });
    } else if (status === 'unauthenticated') {
      resetUser();
    }
  }, [session, status]);

  return <>{children}</>;
}
