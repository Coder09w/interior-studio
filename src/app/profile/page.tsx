'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Sofa,
  User,
  Settings,
  LogOut,
  Loader2,
  Camera,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';


// ─── Wall Color Options ──────────────────────────────────────────────────────

const wallColorOptions = [
  { color: '#FAF8F4', label: 'Ivory' },
  { color: '#E8E2D8', label: 'Warm Gray' },
  { color: '#D4C8B8', label: 'Taupe' },
  { color: '#B8C4C0', label: 'Sage' },
  { color: '#C4B8A8', label: 'Sand' },
  { color: '#FFFFFF', label: 'White' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  email: string;
  image: string | null;
  defaultRoomW: number;
  defaultRoomD: number;
  defaultRoomH: number;
  defaultWallColor: string;
  autoSave: boolean;
}

// ─── Profile Content ─────────────────────────────────────────────────────────

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Profile state
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences state
  const [roomW, setRoomW] = useState(8);
  const [roomD, setRoomD] = useState(6);
  const [roomH, setRoomH] = useState(3);
  const [wallColor, setWallColor] = useState('#FAF8F4');
  const [autoSave, setAutoSave] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data: ProfileData = await res.json();
        setName(data.name || '');
        setRoomW(data.defaultRoomW);
        setRoomD(data.defaultRoomD);
        setRoomH(data.defaultRoomH);
        setWallColor(data.defaultWallColor);
        setAutoSave(data.autoSave);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  // Save profile
  const handleSaveProfile = async () => {
    if (isSavingProfile) return;
    setIsSavingProfile(true);

    try {
      if (newPassword && newPassword !== confirmPassword) {
        toast({
          title: 'Passwords don\'t match',
          description: 'New password and confirmation must match.',
          variant: 'destructive',
        });
        setIsSavingProfile(false);
        return;
      }

      const body: Record<string, unknown> = { name };

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been saved successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    if (isSavingPrefs) return;
    setIsSavingPrefs(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultRoomW: roomW,
          defaultRoomD: roomD,
          defaultRoomH: roomH,
          defaultWallColor: wallColor,
          autoSave,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Preferences saved',
          description: 'Your default room settings have been updated.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save preferences.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // User initials
  const getUserInitials = () => {
    const n = session?.user?.name || '';
    if (!n) return 'U';
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <p style={{ color: '#8A8478' }} className="text-sm">
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

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
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
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
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
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
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push('/dashboard')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
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
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#2D2D2D' }}
        >
          Profile & Settings
        </h1>
        <p className="text-sm mb-8" style={{ color: '#8A8478' }}>
          Manage your account and design preferences
        </p>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList
            className="mb-6 w-fit"
            style={{ backgroundColor: '#F0E8D8' }}
          >
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-[#2D2D2D] text-[#8A8478]"
            >
              <User className="w-4 h-4 mr-1.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-white data-[state=active]:text-[#2D2D2D] text-[#8A8478]"
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* ─── Profile Tab ──────────────────────────────────────────────── */}
          <TabsContent value="profile">
            <Card style={{ borderColor: '#E2DDD4' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2D2D2D' }}>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={session.user?.image || ''}
                      alt={session.user?.name || 'User'}
                    />
                    <AvatarFallback
                      className="text-xl font-semibold"
                      style={{ backgroundColor: '#F0E8D8', color: '#8B7355' }}
                    >
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
                    >
                      <Camera className="w-4 h-4 mr-1.5" />
                      Change Photo
                    </Button>
                    <p className="text-xs mt-1.5" style={{ color: '#8A8478' }}>
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" style={{ color: '#2D2D2D' }}>
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11"
                    style={{ borderColor: '#E2DDD4' }}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: '#2D2D2D' }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={session.user?.email || ''}
                    disabled
                    className="h-11 bg-muted"
                    style={{ borderColor: '#E2DDD4' }}
                  />
                  <p className="text-xs" style={{ color: '#8A8478' }}>
                    Email cannot be changed.
                  </p>
                </div>

                {/* Change Password Section */}
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: '#E2DDD4' }}
                >
                  <h3
                    className="font-semibold text-base mb-4"
                    style={{ color: '#2D2D2D' }}
                  >
                    Change Password
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        style={{ color: '#2D2D2D' }}
                      >
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-11"
                        style={{ borderColor: '#E2DDD4' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="newPassword"
                          style={{ color: '#2D2D2D' }}
                        >
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="h-11"
                          style={{ borderColor: '#E2DDD4' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          style={{ color: '#2D2D2D' }}
                        >
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="h-11"
                          style={{ borderColor: '#E2DDD4' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="font-medium text-white cursor-pointer"
                    style={{ backgroundColor: '#C17F4E' }}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1.5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Preferences Tab ──────────────────────────────────────────── */}
          <TabsContent value="preferences">
            <Card style={{ borderColor: '#E2DDD4' }}>
              <CardHeader>
                <CardTitle style={{ color: '#2D2D2D' }}>
                  Default Room Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room Width */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label style={{ color: '#2D2D2D' }}>
                      Default Room Width
                    </Label>
                    <span
                      className="text-sm font-medium px-2.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: '#F0E8D8',
                        color: '#8B7355',
                      }}
                    >
                      {roomW}m
                    </span>
                  </div>
                  <Slider
                    value={[roomW]}
                    min={4}
                    max={14}
                    step={0.5}
                    onValueChange={([v]) => setRoomW(v)}
                    className="w-full"
                  />
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: '#8A8478' }}
                  >
                    <span>4m</span>
                    <span>14m</span>
                  </div>
                </div>

                {/* Room Depth */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label style={{ color: '#2D2D2D' }}>
                      Default Room Depth
                    </Label>
                    <span
                      className="text-sm font-medium px-2.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: '#F0E8D8',
                        color: '#8B7355',
                      }}
                    >
                      {roomD}m
                    </span>
                  </div>
                  <Slider
                    value={[roomD]}
                    min={4}
                    max={12}
                    step={0.5}
                    onValueChange={([v]) => setRoomD(v)}
                    className="w-full"
                  />
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: '#8A8478' }}
                  >
                    <span>4m</span>
                    <span>12m</span>
                  </div>
                </div>

                {/* Ceiling Height */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label style={{ color: '#2D2D2D' }}>
                      Default Ceiling Height
                    </Label>
                    <span
                      className="text-sm font-medium px-2.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: '#F0E8D8',
                        color: '#8B7355',
                      }}
                    >
                      {roomH}m
                    </span>
                  </div>
                  <Slider
                    value={[roomH]}
                    min={2.5}
                    max={5}
                    step={0.25}
                    onValueChange={([v]) => setRoomH(v)}
                    className="w-full"
                  />
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: '#8A8478' }}
                  >
                    <span>2.5m</span>
                    <span>5m</span>
                  </div>
                </div>

                {/* Default Wall Color */}
                <div className="space-y-3">
                  <Label style={{ color: '#2D2D2D' }}>
                    Default Wall Color
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {wallColorOptions.map((opt) => (
                      <button
                        key={opt.color}
                        type="button"
                        onClick={() => setWallColor(opt.color)}
                        className="flex flex-col items-center gap-1.5 group cursor-pointer"
                        title={opt.label}
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 transition-all duration-150 group-hover:scale-110"
                          style={{
                            backgroundColor: opt.color,
                            borderColor:
                              wallColor === opt.color ? '#C17F4E' : '#E2DDD4',
                            boxShadow:
                              wallColor === opt.color
                                ? '0 0 0 3px #C17F4E30'
                                : 'none',
                          }}
                        />
                        <span
                          className="text-xs"
                          style={{
                            color:
                              wallColor === opt.color ? '#C17F4E' : '#8A8478',
                            fontWeight:
                              wallColor === opt.color ? 600 : 400,
                          }}
                        >
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-save Toggle */}
                <div
                  className="flex items-center justify-between py-3 border-t"
                  style={{ borderColor: '#E2DDD4' }}
                >
                  <div>
                    <Label style={{ color: '#2D2D2D' }} className="text-base">
                      Auto-save
                    </Label>
                    <p className="text-xs mt-0.5" style={{ color: '#8A8478' }}>
                      Automatically save changes as you design
                    </p>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                    className="data-[state=checked]:bg-[#C17F4E]"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSavePreferences}
                    disabled={isSavingPrefs}
                    className="font-medium text-white cursor-pointer"
                    style={{ backgroundColor: '#C17F4E' }}
                  >
                    {isSavingPrefs ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1.5" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ─── Main Page Export ────────────────────────────────────────────────────────

export default function ProfilePage() {
  return <ProfileContent />;
}
