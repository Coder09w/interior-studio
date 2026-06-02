'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import EditorLoader from '@/components/EditorLoader';

// Dynamic import to avoid SSR issues with Three.js
const InteriorStudio = dynamic(() => import('@/components/InteriorStudio'), {
  ssr: false,
  loading: () => <EditorLoader />,
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
    return <EditorLoader />;
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#F5F0E8' }}>
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#2D2D2D' }}>
            {error || 'Project not found'}
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
