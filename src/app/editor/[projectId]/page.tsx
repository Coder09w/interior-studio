'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with Three.js
const InteriorStudio = dynamic(() => import('@/components/InteriorStudio'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
      <div className="text-center max-w-sm w-full px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
            <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
            <path d="M4 18v2" />
            <path d="M20 18v2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Interior Studio</h2>
        <div className="mt-5 mb-3 w-full h-2 rounded-full overflow-hidden" style={{ background: '#E2DDD4' }}>
          <div className="h-full rounded-full animate-pulse" style={{ width: '60%', background: 'linear-gradient(90deg, #C17F4E, #D4A76A)' }} />
        </div>
        <p className="text-sm" style={{ color: '#8A8478' }}>Loading 3D Editor...</p>
      </div>
    </div>
  ),
});

interface RoomData {
  id: string;
  name: string;
  roomType: string;
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorType: string;
  doorWall: string;
  windowCount: number;
  windowWall: string;
  lightMood: string;
  furniture: string;
}

interface ProjectData {
  id: string;
  name: string;
  rooms: RoomData[];
}

export default function EditorProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch project data
  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }
      if (res.status === 404) {
        setError('Project not found');
        return;
      }
      if (!res.ok) {
        setError('Failed to load project');
        return;
      }
      const data = await res.json();
      setProject(data);
    } catch {
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProject();
    }
  }, [status, fetchProject]);

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C17F4E' }} />
          <p style={{ color: '#8A8478' }} className="text-sm">
            Loading project…
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#2D2D2D' }}>
            {error || 'Project not found'}
          </h2>
          <p className="text-sm mb-4" style={{ color: '#8A8478' }}>
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
