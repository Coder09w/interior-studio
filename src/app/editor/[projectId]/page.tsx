'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import EditorLoader from '@/components/EditorLoader';
import { useProject } from '@/hooks/use-swr';

// Dynamic import to avoid SSR issues with Three.js
const InteriorStudio = dynamic(() => import('@/components/InteriorStudio'), {
  ssr: false,
  loading: () => <EditorLoader />,
});

export default function EditorProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const projectId = params.projectId as string;

  // ── Phase 2: SWR for project data ──
  // Replaces manual fetch + useState + useCallback with SWR hook.
  // Automatically deduplicates, caches, and revalidates.
  const { project, isLoading, isError } = useProject(
    status === 'authenticated' ? projectId : null // Only fetch when authenticated
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading' || isLoading) {
    return <EditorLoader />;
  }

  // Error state — includes 404 and other failures
  if (isError || !project) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#2D2D2D' }}>
            {isError ? 'Failed to load project' : 'Project not found'}
          </h2>
          <p className="text-sm mb-4" style={{ color: '#5A4E42' }}>
            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: '#C17F4E' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <InteriorStudio />;
}
