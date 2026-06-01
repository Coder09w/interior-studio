'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Sofa,
  Bed,
  Home,
  Minus,
  Lamp,
  Wrench,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


// ─── Types ───────────────────────────────────────────────────────────────────

type RoomType = 'living' | 'bedroom' | 'fullhouse';
type StyleType = 'minimalist' | 'scandinavian' | 'industrial' | 'bohemian';

interface RoomOption {
  id: RoomType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface StyleOption {
  id: StyleType;
  label: string;
  description: string;
  icon: React.ReactNode;
  palette: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const roomOptions: RoomOption[] = [
  {
    id: 'living',
    label: 'Living Room',
    description: 'Design a cozy living space',
    icon: <Sofa className="w-10 h-10" />,
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    description: 'Create a restful retreat',
    icon: <Bed className="w-10 h-10" />,
  },
  {
    id: 'fullhouse',
    label: 'Full House',
    description: 'Plan your entire home',
    icon: <Home className="w-10 h-10" />,
  },
];

const styleOptions: StyleOption[] = [
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'Clean, simple, white & light tones',
    icon: <Minus className="w-8 h-8" />,
    palette: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D0D0D0'],
  },
  {
    id: 'scandinavian',
    label: 'Scandinavian',
    description: 'Warm woods, cozy, neutral palette',
    icon: <Lamp className="w-8 h-8" />,
    palette: ['#F5EFE6', '#D4B896', '#A68B6B', '#8A7B6B'],
  },
  {
    id: 'industrial',
    label: 'Industrial',
    description: 'Dark metals, raw textures, bold',
    icon: <Wrench className="w-8 h-8" />,
    palette: ['#3D3D3D', '#5C5C5C', '#8B7355', '#A09080'],
  },
  {
    id: 'bohemian',
    label: 'Bohemian',
    description: 'Colorful, eclectic, rich patterns',
    icon: <Palette className="w-8 h-8" />,
    palette: ['#C17F4E', '#7A8B6F', '#C49898', '#6B5B8A'],
  },
];

const ROOM_TYPE_MAP: Record<RoomType, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  fullhouse: 'Full House',
};

const STYLE_MAP: Record<StyleType, string> = {
  minimalist: 'Minimalist',
  scandinavian: 'Scandinavian',
  industrial: 'Industrial',
  bohemian: 'Bohemian',
};

// ─── Onboarding Content ──────────────────────────────────────────────────────

function OnboardingContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [fadeDir, setFadeDir] = useState<'in' | 'out'>('in');

  const goToStep = useCallback(
    (target: 1 | 2 | 3) => {
      setFadeDir('out');
      setTimeout(() => {
        setStep(target);
        setFadeDir('in');
      }, 200);
    },
    []
  );

  const handleCreateProject = async () => {
    if (!selectedRoom || !selectedStyle || isCreating) return;
    setIsCreating(true);

    try {
      // Create project with selected options
      const roomTypeMap: Record<RoomType, string> = {
        living: 'living',
        bedroom: 'bedroom',
        fullhouse: 'living',
      };

      const styleToWallColor: Record<StyleType, string> = {
        minimalist: '#FFFFFF',
        scandinavian: '#FAF8F4',
        industrial: '#E8E2D8',
        bohemian: '#F0E8D8',
      };

      const projectName = `${STYLE_MAP[selectedStyle]} ${ROOM_TYPE_MAP[selectedRoom]}`;

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          roomType: roomTypeMap[selectedRoom],
          style: selectedStyle,
          wallColor: styleToWallColor[selectedStyle],
        }),
      });

      if (res.ok) {
        const project = await res.json();

        // Mark onboarding as complete
        await fetch('/api/user/onboarding', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboarding: true }),
        });

        // Redirect to editor
        router.push(`/editor/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setIsCreating(false);
    }
  };

  const userName = session?.user?.name?.split(' ')[0] || 'Designer';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
              style={{
                backgroundColor: s <= step ? '#C17F4E' : '#E2DDD4',
                color: s <= step ? '#FFFFFF' : '#5A4E42',
              }}
            >
              {s < step ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                s
              )}
            </div>
            {s < 3 && (
              <div
                className="w-12 h-0.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: s < step ? '#C17F4E' : '#E2DDD4',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content with fade animation */}
      <div
        className="w-full max-w-2xl transition-all duration-200"
        style={{
          opacity: fadeDir === 'in' ? 1 : 0,
          transform: fadeDir === 'in' ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        {/* ─── Step 1: Room Type ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="text-center">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: '#2D2D2D' }}
            >
              Welcome to Interior Studio{userName ? `, ${userName}` : ''}!
            </h1>
            <p
              className="text-lg mb-8"
              style={{ color: '#5A4E42' }}
            >
              What are you designing first?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {roomOptions.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg py-0"
                  style={{
                    borderColor:
                      selectedRoom === room.id ? '#C17F4E' : '#E2DDD4',
                    borderWidth: selectedRoom === room.id ? '2px' : '1px',
                    backgroundColor:
                      selectedRoom === room.id ? '#FDF8F3' : '#FFFFFF',
                  }}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-3" style={{ minHeight: '180px' }}>
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-200"
                      style={{
                        backgroundColor:
                          selectedRoom === room.id ? '#C17F4E15' : '#F0E8D8',
                        color:
                          selectedRoom === room.id ? '#C17F4E' : '#5A4E42',
                      }}
                    >
                      {room.icon}
                    </div>
                    <h3
                      className="font-semibold text-base"
                      style={{ color: '#2D2D2D' }}
                    >
                      {room.label}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: '#5A4E42' }}
                    >
                      {room.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              size="lg"
              disabled={!selectedRoom}
              onClick={() => goToStep(2)}
              className="font-medium text-white px-8 cursor-pointer"
              style={{ backgroundColor: '#C17F4E' }}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* ─── Step 2: Style ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="text-center">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: '#2D2D2D' }}
            >
              Pick a Style
            </h1>
            <p
              className="text-lg mb-8"
              style={{ color: '#5A4E42' }}
            >
              Choose the aesthetic that inspires you
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {styleOptions.map((style) => (
                <Card
                  key={style.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg py-0"
                  style={{
                    borderColor:
                      selectedStyle === style.id ? '#C17F4E' : '#E2DDD4',
                    borderWidth: selectedStyle === style.id ? '2px' : '1px',
                    backgroundColor:
                      selectedStyle === style.id ? '#FDF8F3' : '#FFFFFF',
                  }}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <CardContent className="p-5" style={{ minHeight: '160px' }}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor:
                            selectedStyle === style.id ? '#C17F4E15' : '#F0E8D8',
                          color:
                            selectedStyle === style.id ? '#C17F4E' : '#5A4E42',
                        }}
                      >
                        {style.icon}
                      </div>
                      <div className="text-left flex-1">
                        <h3
                          className="font-semibold text-base mb-1"
                          style={{ color: '#2D2D2D' }}
                        >
                          {style.label}
                        </h3>
                        <p
                          className="text-xs mb-3"
                          style={{ color: '#5A4E42' }}
                        >
                          {style.description}
                        </p>
                        {/* Color preview strip */}
                        <div className="flex gap-1.5">
                          {style.palette.map((color, idx) => (
                            <div
                              key={idx}
                              className="h-5 flex-1 rounded-sm first:rounded-l-md last:rounded-r-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => goToStep(1)}
                className="font-medium cursor-pointer"
                style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                size="lg"
                disabled={!selectedStyle}
                onClick={() => goToStep(3)}
                className="font-medium text-white px-8 cursor-pointer"
                style={{ backgroundColor: '#C17F4E' }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Ready! ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#C17F4E15' }}
            >
              <CheckCircle2
                className="w-10 h-10"
                style={{ color: '#C17F4E' }}
              />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: '#2D2D2D' }}
            >
              Your Room is Ready!
            </h1>
            <p
              className="text-lg mb-2"
              style={{ color: '#5A4E42' }}
            >
              You&apos;re all set!
            </p>
            <p
              className="text-lg font-medium mb-8"
              style={{ color: '#C17F4E' }}
            >
              Let&apos;s start designing your{' '}
              {selectedStyle ? STYLE_MAP[selectedStyle] : ''}{' '}
              {selectedRoom ? ROOM_TYPE_MAP[selectedRoom] : ''}.
            </p>

            {/* Preview card */}
            <Card
              className="mb-8 py-0 max-w-xs mx-auto"
              style={{ borderColor: '#E2DDD4' }}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  {selectedStyle && (
                    <div
                      className="flex gap-1"
                    >
                      {styleOptions
                        .find((s) => s.id === selectedStyle)
                        ?.palette.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full border"
                            style={{
                              backgroundColor: color,
                              borderColor: '#E2DDD4',
                            }}
                          />
                        ))}
                    </div>
                  )}
                  <div className="text-left">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#2D2D2D' }}
                    >
                      {selectedStyle ? STYLE_MAP[selectedStyle] : ''}{' '}
                      {selectedRoom ? ROOM_TYPE_MAP[selectedRoom] : ''}
                    </p>
                    <p className="text-xs" style={{ color: '#5A4E42' }}>
                      Your first project
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => goToStep(2)}
                className="font-medium cursor-pointer"
                style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                size="lg"
                disabled={isCreating}
                onClick={handleCreateProject}
                className="font-semibold text-white px-8 h-12 text-base cursor-pointer"
                style={{ backgroundColor: '#C17F4E' }}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating…
                  </>
                ) : (
                  <>
                    Start Designing
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page Export ────────────────────────────────────────────────────────

export default function OnboardingPage() {
  return <OnboardingContent />;
}
