'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import posthog from 'posthog-js'

/**
 * PostHogProvider — identifies authenticated users in PostHog
 * and resets on logout.
 *
 * PostHog itself is initialized in instrumentation-client.ts (Next.js 15.3+).
 * This provider only handles user identification.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      posthog.identify(session.user.id!, {
        email: session.user.email || '',
        name: session.user.name || '',
        plan: (session.user as Record<string, unknown>).plan as string || 'free',
      })
    } else if (status === 'unauthenticated') {
      posthog.reset()
    }
  }, [session, status])

  return <>{children}</>
}
