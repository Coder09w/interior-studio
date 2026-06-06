/**
 * SWR Data Fetching Hooks for Instod
 *
 * Phase 2 — Council-approved SWR integration for stale-while-revalidate
 * data fetching pattern. Benefits:
 *
 * - Instant data on return visits (served from SWR cache)
 * - Background revalidation keeps data fresh
 * - Request deduplication prevents API waterfalls
 * - Built-in error handling and retry logic
 *
 * Architecture (Dan Abramov's recommendation):
 *   User sees stale data instantly → fresh data loads silently in background
 *   → React re-renders with fresh data. No loading spinners on return visits.
 */

import useSWR from 'swr';

// ─── Generic Fetcher ────────────────────────────────────────────────────────
// Simple async fetcher that throws on non-OK responses.
// SWR catches these errors and surfaces them via the `error` return value.

async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Fetch failed');
    // Attach extra info for debugging
    (error as Error & { status: number }).status = res.status;
    throw error;
  }
  return res.json() as Promise<T>;
}

// ─── Shared SWR Config ──────────────────────────────────────────────────────
// These defaults apply to all SWR hooks unless overridden per-call.

const SWR_DEFAULTS = {
  revalidateOnFocus: false,        // Don't refetch when user switches tabs
  revalidateIfStale: true,         // Refetch in background if data is old
  dedupingInterval: 60000,         // Dedupe identical requests within 60s
  focusThrottleInterval: 5000,     // Throttle focus-triggered revalidations
  errorRetryCount: 2,              // Retry failed requests up to 2 times
  errorRetryInterval: 3000,        // Wait 3s between retries
};

// ─── Project Types ──────────────────────────────────────────────────────────

export interface SWRProject {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  rooms: Array<{
    id: string;
    name: string;
    roomType: string;
  }>;
}

export interface SWRUsageStats {
  projects: { current: number; limit: number | null };
  roomsPerProject: { current: number; limit: number | null };
  furniturePerRoom: { current: number; limit: number | null };
  plan: string;
  planName: string;
}

// ─── useProjects ────────────────────────────────────────────────────────────
// Fetches the user's project list. Returns cached data instantly on
// return visits, revalidates in the background.

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<SWRProject[]>(
    '/api/projects',
    fetcher,
    {
      ...SWR_DEFAULTS,
      // Projects rarely change — longer deduplication window
      dedupingInterval: 30000,
    }
  );

  return {
    projects: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate, // Expose mutate for optimistic updates after create/delete/rename
  };
}

// ─── useUsageStats ──────────────────────────────────────────────────────────
// Fetches plan usage statistics. Used to display the usage bars and
// upgrade banner on the dashboard.

export function useUsageStats() {
  const { data, error, isLoading, mutate } = useSWR<SWRUsageStats>(
    '/api/plan/usage',
    fetcher,
    {
      ...SWR_DEFAULTS,
      // Usage stats change when user creates/deletes projects — moderate TTL
      dedupingInterval: 15000,
    }
  );

  return {
    usageStats: data ?? null,
    isLoading,
    isError: !!error,
    error,
    mutate, // Expose mutate for refresh after project operations
  };
}

// ─── useProject ─────────────────────────────────────────────────────────────
// Fetches a single project by ID. Used on the editor/[projectId] page.

export function useProject(projectId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<SWRProject>(
    projectId ? `/api/projects/${projectId}` : null, // null = don't fetch
    fetcher,
    {
      ...SWR_DEFAULTS,
      dedupingInterval: 30000,
    }
  );

  return {
    project: data ?? null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
