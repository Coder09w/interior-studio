'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import {
  Sofa,
  Plus,
  MoreHorizontal,
  FolderOpen,
  Pencil,
  Trash2,
  User,
  LogOut,
  LayoutGrid,
  Loader2,
  Home,
  Crown,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type PlanKey, PLAN_CONFIG, getUpgradePlan } from '@/lib/plans';


// ─── Types ────────────────────────────────────────────────────────────────────

interface Room {
  id: string;
  name: string;
  roomType: string;
}

interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  rooms: Room[];
}

interface UsageStats {
  projects: { current: number; limit: number | null };
  roomsPerProject: { current: number; limit: number | null };
  furniturePerRoom: { current: number; limit: number | null };
  plan: PlanKey;
  planName: string;
}

// ─── Room type display helpers ───────────────────────────────────────────────

const ROOM_TYPE_LABELS: Record<string, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  office: 'Office',
  dining: 'Dining Room',
};

const ROOM_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  living: { bg: '#F0E8D8', text: '#8B7355' },
  bedroom: { bg: '#E8E0F0', text: '#6B5B8A' },
  kitchen: { bg: '#E0F0E8', text: '#4A7A5A' },
  bathroom: { bg: '#E0E8F0', text: '#4A6A8A' },
  office: { bg: '#F0E0D8', text: '#8A5A4A' },
  dining: { bg: '#F0E8E0', text: '#7A6A4A' },
};

const PLAN_STYLES: Record<PlanKey, { bg: string; text: string; icon: typeof Crown }> = {
  free: { bg: '#F0E8D8', text: '#8B7355', icon: Sofa },
  pro: { bg: '#C17F4E15', text: '#C17F4E', icon: Zap },
  studio: { bg: '#C17F4E25', text: '#A86A3D', icon: Crown },
};

// ─── Dashboard Content ───────────────────────────────────────────────────────

function DashboardContent() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const currentPlan = (session?.user as Record<string, unknown>)?.plan as PlanKey || 'free';
  const planConfig = PLAN_CONFIG[currentPlan];
  const upgradePlan = getUpgradePlan(currentPlan);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Check for upgrade success param
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      // Refresh session to get new plan
      updateSession();
      // Show a brief success indicator
      const timer = setTimeout(() => {
        // Remove query param
        window.history.replaceState({}, '', '/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, updateSession]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch usage stats
  const fetchUsageStats = useCallback(async () => {
    try {
      const res = await fetch('/api/plan/usage');
      if (res.ok) {
        const data = await res.json();
        setUsageStats(data);
        // Show upgrade banner for free users approaching limits
        if (data.plan === 'free') {
          const projectPct = data.projects.limit ? data.projects.current / data.projects.limit : 0;
          setShowUpgradeBanner(projectPct >= 0.66); // Show at 2/3 projects used
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
      fetchUsageStats();
    }
  }, [status, fetchProjects, fetchUsageStats]);

  // Create new project
  const handleCreateProject = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `My Design ${projects.length + 1}` }),
      });

      if (res.status === 403) {
        const data = await res.json();
        // Plan limit reached — show upgrade prompt
        alert(data.error || 'You have reached your project limit. Please upgrade your plan.');
        router.push('/pricing');
        return;
      }

      if (res.ok) {
        const project = await res.json();
        fetchUsageStats(); // Refresh usage
        router.push(`/editor/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!selectedProject || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.filter((p) => p.id !== selectedProject.id)
        );
        setDeleteDialogOpen(false);
        setSelectedProject(null);
        fetchUsageStats(); // Refresh usage
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Rename project
  const handleRenameProject = async () => {
    if (!selectedProject || !renameValue.trim() || isRenaming) return;
    setIsRenaming(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setRenameDialogOpen(false);
        setSelectedProject(null);
        setRenameValue('');
      }
    } catch (error) {
      console.error('Failed to rename project:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  // Get unique room types from a project
  const getRoomTypes = (project: Project) => {
    const types = [...new Set(project.rooms.map((r) => r.roomType))];
    return types.slice(0, 3); // Max 3 tags shown
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  // User initials for avatar fallback
  const getUserInitials = () => {
    const name = session?.user?.name || '';
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Usage percentage
  const getUsagePercent = (current: number, limit: number | null) => {
    if (!limit) return 0; // unlimited
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  // Loading state
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: '#C17F4E' }}
          />
          <p style={{ color: '#6B6358' }} className="text-sm">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!session) return null;

  const PlanIcon = PLAN_STYLES[currentPlan].icon;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F0E8' }}>
      {/* ─── Top Nav Bar ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E2DDD4',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: '#C17F4E' }}
            >
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight hidden sm:inline"
              style={{ color: '#2D2D2D' }}
            >
              Interior Studio
            </span>
            <span
              className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full text-white hidden sm:inline"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              BETA
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Plan Badge */}
            <button
              onClick={() => currentPlan !== 'studio' ? router.push('/pricing') : undefined}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
              style={{
                background: PLAN_STYLES[currentPlan].bg,
                color: PLAN_STYLES[currentPlan].text,
              }}
            >
              <PlanIcon className="w-3.5 h-3.5" />
              {planConfig.name}
              {currentPlan !== 'studio' && <ChevronRight className="w-3 h-3" />}
            </button>

            <span
              className="text-sm font-medium hidden md:inline"
              style={{ color: '#2D2D2D' }}
            >
              {session.user?.name || session.user?.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user?.image || ''}
                      alt={session.user?.name || 'User'}
                    />
                    <AvatarFallback
                      style={{ backgroundColor: '#F0E8D8', color: '#8B7355' }}
                      className="text-sm font-semibold"
                    >
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile & Billing
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/pricing')}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome + Plan Info */}
        <div className="mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: '#2D2D2D' }}
          >
            {session.user?.name ? `Welcome back, ${session.user.name.split(' ')[0]}!` : 'Welcome to your Studio!'}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B6358' }}>
            {projects.length === 0
              ? 'Start creating your dream spaces'
              : `You have ${projects.length} design${projects.length === 1 ? '' : 's'} in your workspace`}
          </p>
        </div>

        {/* Upgrade Banner (for free users approaching limits) */}
        {showUpgradeBanner && upgradePlan && (
          <div className="mb-6">
            <div
              className="flex items-center justify-between gap-4 p-4 rounded-xl border-2"
              style={{
                background: 'linear-gradient(135deg, #FFFAF5, #FFF5EB)',
                borderColor: '#C17F4E40',
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#C17F4E15' }}
                >
                  <Zap className="w-5 h-5" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#2D2D2D' }}>
                    You&apos;re using {usageStats?.projects.current} of {usageStats?.projects.limit} free projects
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6358' }}>
                    Upgrade to {PLAN_CONFIG[upgradePlan].name} for {PLAN_CONFIG[upgradePlan].maxProjects ?? 'unlimited'} projects, {PLAN_CONFIG[upgradePlan].maxRoomsPerProject ?? 'unlimited'} rooms, and more features.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="text-white font-medium gap-1"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
                <button
                  onClick={() => setShowUpgradeBanner(false)}
                  className="p-1 rounded-md hover:bg-black/5"
                  style={{ color: '#6B6358' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Stats Cards */}
        {usageStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Projects Usage */}
            <div
              className="rounded-xl border p-4"
              style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#6B6358' }}>Projects</span>
                <span className="text-xs font-semibold" style={{ color: '#2D2D2D' }}>
                  {usageStats.projects.current} / {usageStats.projects.limit ?? '∞'}
                </span>
              </div>
              <Progress
                value={getUsagePercent(usageStats.projects.current, usageStats.projects.limit)}
                className="h-2"
                style={{
                  // @ts-expect-error CSS custom property
                  '--progress-foreground': getUsagePercent(usageStats.projects.current, usageStats.projects.limit) >= 90 ? '#E53E3E' : '#C17F4E',
                }}
              />
            </div>

            {/* Rooms per Project */}
            <div
              className="rounded-xl border p-4"
              style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#6B6358' }}>Rooms / Project</span>
                <span className="text-xs font-semibold" style={{ color: '#2D2D2D' }}>
                  {usageStats.roomsPerProject.current} / {usageStats.roomsPerProject.limit ?? '∞'}
                </span>
              </div>
              <Progress
                value={getUsagePercent(usageStats.roomsPerProject.current, usageStats.roomsPerProject.limit)}
                className="h-2"
                style={{
                  // @ts-expect-error CSS custom property
                  '--progress-foreground': getUsagePercent(usageStats.roomsPerProject.current, usageStats.roomsPerProject.limit) >= 90 ? '#E53E3E' : '#C17F4E',
                }}
              />
            </div>

            {/* Furniture per Room */}
            <div
              className="rounded-xl border p-4"
              style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#6B6358' }}>Furniture / Room</span>
                <span className="text-xs font-semibold" style={{ color: '#2D2D2D' }}>
                  {usageStats.furniturePerRoom.current} / {usageStats.furniturePerRoom.limit ?? '∞'}
                </span>
              </div>
              <Progress
                value={getUsagePercent(usageStats.furniturePerRoom.current, usageStats.furniturePerRoom.limit)}
                className="h-2"
                style={{
                  // @ts-expect-error CSS custom property
                  '--progress-foreground': getUsagePercent(usageStats.furniturePerRoom.current, usageStats.furniturePerRoom.limit) >= 90 ? '#E53E3E' : '#C17F4E',
                }}
              />
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* + New Project Card */}
          <Card
            className="group cursor-pointer border-2 border-dashed transition-all duration-200 hover:shadow-md hover:border-solid py-0"
            style={{
              borderColor: '#C17F4E40',
              backgroundColor: '#FFFFFF',
              minHeight: '220px',
            }}
            onClick={handleCreateProject}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-6 gap-4" style={{ minHeight: '220px' }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: '#F0E8D8' }}
              >
                <Plus
                  className="w-7 h-7"
                  style={{ color: '#C17F4E' }}
                />
              </div>
              <div className="text-center">
                <p
                  className="font-semibold text-base"
                  style={{ color: '#C17F4E' }}
                >
                  Create New Project
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: '#6B6358' }}
                >
                  Start designing a new space
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Existing Project Cards */}
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer transition-all duration-200 hover:shadow-md py-0"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2DDD4',
                minHeight: '220px',
              }}
              onClick={() => router.push(`/editor/${project.id}`)}
            >
              <CardContent className="flex flex-col justify-between p-6" style={{ minHeight: '220px' }}>
                {/* Top: Room preview area */}
                <div className="flex-1 flex flex-col">
                  {/* Thumbnail placeholder */}
                  <div
                    className="w-full h-20 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FAF8F4' }}
                  >
                    <Home
                      className="w-8 h-8"
                      style={{ color: '#E2DDD4' }}
                    />
                  </div>

                  {/* Project name */}
                  <h3
                    className="font-semibold text-base leading-tight mb-1 line-clamp-1"
                    style={{ color: '#2D2D2D' }}
                  >
                    {project.name}
                  </h3>

                  {/* Room count + last updated */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs"
                      style={{ color: '#6B6358' }}
                    >
                      {project.rooms.length} room{project.rooms.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ color: '#E2DDD4' }}>·</span>
                    <span
                      className="text-xs"
                      style={{ color: '#6B6358' }}
                    >
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  </div>

                  {/* Room type tags */}
                  {project.rooms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {getRoomTypes(project).map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs font-medium px-2 py-0.5 rounded-md border-0"
                          style={{
                            backgroundColor: ROOM_TYPE_COLORS[type]?.bg || '#F0E8D8',
                            color: ROOM_TYPE_COLORS[type]?.text || '#8B7355',
                          }}
                        >
                          {ROOM_TYPE_LABELS[type] || type}
                        </Badge>
                      ))}
                      {project.rooms.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium px-2 py-0.5 rounded-md border-0"
                          style={{
                            backgroundColor: '#F0E8D8',
                            color: '#6B6358',
                          }}
                        >
                          +{project.rooms.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* 3-dot menu */}
                <div className="flex justify-end mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        style={{ color: '#6B6358' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/editor/${project.id}`);
                        }}
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setRenameValue(project.name);
                          setRenameDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ backgroundColor: '#F0E8D8' }}
            >
              <LayoutGrid
                className="w-10 h-10"
                style={{ color: '#C17F4E' }}
              />
            </div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: '#2D2D2D' }}
            >
              No projects yet
            </h2>
            <p
              className="text-sm text-center max-w-sm mb-6"
              style={{ color: '#6B6358' }}
            >
              Create your first design and start visualizing your dream spaces in 3D.
            </p>
            <Button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="font-medium text-white px-6 cursor-pointer"
              style={{ backgroundColor: '#C17F4E' }}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Your First Project
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* ─── Delete Confirmation Dialog ──────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent style={{ backgroundColor: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#2D2D2D' }}>Delete Project</DialogTitle>
            <DialogDescription style={{ color: '#6B6358' }}>
              Are you sure you want to delete &quot;{selectedProject?.name}&quot;? This action cannot be undone. All rooms and furniture data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedProject(null);
              }}
              className="cursor-pointer"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Rename Dialog ───────────────────────────────────────────────── */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent style={{ backgroundColor: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#2D2D2D' }}>Rename Project</DialogTitle>
            <DialogDescription style={{ color: '#6B6358' }}>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Project name"
            className="h-11"
            style={{ borderColor: '#E2DDD4' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameProject();
            }}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false);
                setSelectedProject(null);
                setRenameValue('');
              }}
              className="cursor-pointer"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProject}
              disabled={isRenaming || !renameValue.trim()}
              className="cursor-pointer text-white"
              style={{ backgroundColor: '#C17F4E' }}
            >
              {isRenaming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page Export ────────────────────────────────────────────────────────

export default function DashboardPage() {
  return <DashboardContent />;
}
