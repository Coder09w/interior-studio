'use client';

import { useState, useEffect, useCallback } from 'react';
import { ROOM_IMAGES, POST_TYPES, TONES, RoomImage, PostType, Tone } from '@/lib/hail-mary-images';
import { generateContentCalendar } from '@/lib/hail-mary-templates';

const PASSWORD = '123';
const SESSION_KEY = 'hail-mary-unlocked';

interface GeneratedContent {
  captions: string[];
  hashtags: string[];
  reelScript?: {
    hook: string;
    shots: { duration: string; visual: string; voiceover: string; textOverlay: string }[];
    music: string;
    caption: string;
  };
  source: 'ai' | 'template';
  image: { src: string; label: string; roomType: string };
}

interface SavedAsset {
  id: string;
  imageSrc: string;
  imageLabel: string;
  postType: PostType;
  tone: Tone;
  caption: string;
  hashtags: string[];
  createdAt: string;
}

export default function HailMaryPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') setUnlocked(true);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setDissolving(true);
      setTimeout(() => {
        setUnlocked(true);
        sessionStorage.setItem(SESSION_KEY, 'true');
        setDissolving(false);
      }, 600);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 1500);
    }
  };

  if (!unlocked) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center transition-all duration-600 ${dissolving ? 'opacity-0 scale-105 blur-xl' : 'opacity-100 scale-100 blur-0'}`}
        style={{
          background: '#0A0A0A',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs px-6">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            autoFocus
            placeholder="•"
            className={`w-full bg-transparent text-center text-3xl tracking-[0.5em] font-mono outline-none border-b-2 transition-colors py-3 ${passwordError ? 'border-red-500 text-red-400' : 'border-white/20 text-white focus:border-white/60'}`}
            style={{ caretColor: '#C17F4E' }}
            aria-label="Access code"
          />
          {passwordError && (
            <p className="text-center text-xs text-red-400 mt-3 font-mono">access denied</p>
          )}
        </form>
      </div>
    );
  }

  return <Studio />;
}

function Studio() {
  const [selectedImage, setSelectedImage] = useState<RoomImage>(ROOM_IMAGES[0]);
  const [postType, setPostType] = useState<PostType>('showcase');
  const [tone, setTone] = useState<Tone>('casual');
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'calendar'>('generate');
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load saved assets from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('hail-mary-assets');
      if (stored) setSavedAssets(JSON.parse(stored));
    } catch {}
  }, []);

  const saveAsset = useCallback((asset: SavedAsset) => {
    setSavedAssets((prev) => {
      const next = [asset, ...prev].slice(0, 50);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hail-mary-assets', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/hail-mary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageSrc: selectedImage.src,
          postType,
          tone,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setContent(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const handleSurpriseMe = async () => {
    const randomImage = ROOM_IMAGES[Math.floor(Math.random() * ROOM_IMAGES.length)];
    const randomType = POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)];
    const randomTone = TONES[Math.floor(Math.random() * TONES.length)];
    setSelectedImage(randomImage);
    setPostType(randomType.value);
    setTone(randomTone.value);

    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/hail-mary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageSrc: randomImage.src,
          postType: randomType.value,
          tone: randomTone.value,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setContent(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleSaveAsset = () => {
    if (!content) return;
    const asset: SavedAsset = {
      id: `asset-${Date.now()}`,
      imageSrc: content.image.src,
      imageLabel: content.image.label,
      postType,
      tone,
      caption: content.captions[0],
      hashtags: content.hashtags,
      createdAt: new Date().toISOString(),
    };
    saveAsset(asset);
  };

  const downloadImage = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage.src;
    link.download = `instod-${selectedImage.roomType}-${Date.now()}.webp`;
    link.click();
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#0A0A0A',
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Subtle grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              <span className="text-sm font-bold">H</span>
            </div>
            <div>
              <h1
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Hail Mary
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                content studio · private
              </p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs font-mono text-white/40 hover:text-white/70 transition-colors"
          >
            ← exit
          </a>
        </header>

        {/* Tabs */}
        <nav className="flex items-center gap-1 mb-8 border-b border-white/10">
          {[
            { id: 'generate' as const, label: 'Generate' },
            { id: 'library' as const, label: `Library${savedAssets.length > 0 ? ` (${savedAssets.length})` : ''}` },
            { id: 'calendar' as const, label: 'Calendar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: '#C17F4E' }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Controls */}
            <div className="space-y-6">
              {/* Surprise Me */}
              <button
                onClick={handleSurpriseMe}
                disabled={generating}
                className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #C17F4E, #A86A3D)',
                  boxShadow: generating ? '0 0 30px rgba(193,127,78,0.4)' : 'none',
                }}
              >
                {generating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    generating...
                  </span>
                ) : (
                  '🎲 Surprise Me — one click, full post'
                )}
              </button>

              {/* Image picker */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 block">
                  01 · pick a room
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ROOM_IMAGES.map((img) => (
                    <button
                      key={img.src}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                        selectedImage.src === img.src
                          ? 'ring-2 ring-[#C17F4E] ring-offset-2 ring-offset-[#0A0A0A]'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-2">
                  {selectedImage.label} · {selectedImage.mood}
                </p>
              </div>

              {/* Post type */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 block">
                  02 · post type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POST_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      onClick={() => setPostType(pt.value)}
                      className={`p-3 rounded-lg text-left transition-all border ${
                        postType === pt.value
                          ? 'border-[#C17F4E] bg-[#C17F4E]/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-lg mb-1">{pt.icon}</div>
                      <div className="text-xs font-semibold">{pt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 block">
                  03 · tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                        tone === t.value
                          ? 'border-[#C17F4E] bg-[#C17F4E]/10 text-white'
                          : 'border-white/10 text-white/50 hover:text-white/80'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-white/20 text-white transition-all hover:bg-white/5 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Content →'}
              </button>
            </div>

            {/* Right: Output */}
            <div className="space-y-4">
              {/* Selected image preview */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage.src}
                  alt={selectedImage.label}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={downloadImage}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-colors"
                >
                  ↓ Download
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">
                  {error}
                </div>
              )}

              {content && (
                <div className="space-y-4">
                  {/* Source badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {content.source === 'ai' ? '⚡ AI-generated' : '📝 template-based'}
                    </span>
                    <button
                      onClick={handleSaveAsset}
                      className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                      + save to library
                    </button>
                  </div>

                  {/* Captions */}
                  {postType !== 'reel-script' && (
                    <div className="space-y-3">
                      {content.captions.map((caption, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg border border-white/10 bg-white/[0.03]"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                              variant {i + 1}
                            </span>
                            <button
                              onClick={() => copyToClipboard(caption, `caption-${i}`)}
                              className="text-xs text-white/50 hover:text-white transition-colors"
                            >
                              {copiedField === `caption-${i}` ? '✓ copied' : 'copy'}
                            </button>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">
                            {caption}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reel script */}
                  {postType === 'reel-script' && content.reelScript && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-[#C17F4E]/30 bg-[#C17F4E]/5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#C17F4E] mb-2">hook</p>
                        <p className="text-sm font-medium text-white">{content.reelScript.hook}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">shot list</p>
                        {content.reelScript.shots.map((shot, i) => (
                          <div key={i} className="p-3 rounded-lg border border-white/10 bg-white/[0.03]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono text-[#C17F4E]">{shot.duration}</span>
                            </div>
                            <p className="text-xs text-white/90 mb-1">
                              <span className="text-white/40">visual:</span> {shot.visual}
                            </p>
                            <p className="text-xs text-white/90 mb-1">
                              <span className="text-white/40">voiceover:</span> {shot.voiceover}
                            </p>
                            <p className="text-xs text-white/90">
                              <span className="text-white/40">text overlay:</span> {shot.textOverlay}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03]">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">music</p>
                        <p className="text-xs text-white/90">{content.reelScript.music}</p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(JSON.stringify(content.reelScript, null, 2), 'reel-json')}
                        className="text-xs text-white/50 hover:text-white transition-colors"
                      >
                        {copiedField === 'reel-json' ? '✓ copied script' : 'copy full script (JSON)'}
                      </button>
                    </div>
                  )}

                  {/* Hashtags */}
                  {content.hashtags.length > 0 && (
                    <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                          hashtags ({content.hashtags.length})
                        </span>
                        <button
                          onClick={() => copyToClipboard(content.hashtags.join(' '), 'hashtags')}
                          className="text-xs text-white/50 hover:text-white transition-colors"
                        >
                          {copiedField === 'hashtags' ? '✓ copied' : 'copy all'}
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-white/70 break-words">
                        {content.hashtags.join(' ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!content && !error && !generating && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-4">
                    <span className="text-2xl opacity-30">✨</span>
                  </div>
                  <p className="text-sm text-white/40 max-w-xs">
                    Pick a room, choose a post type, hit generate. Or just click "Surprise Me" for instant content.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div>
            {savedAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-4">
                  <span className="text-2xl opacity-30">📁</span>
                </div>
                <p className="text-sm text-white/40">
                  No saved assets yet. Generate content and click "save to library".
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]"
                  >
                    <div className="aspect-video relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.imageSrc} alt={asset.imageLabel} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-black/70 text-white">
                        {asset.postType}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-white/90 line-clamp-3 mb-2">{asset.caption}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/30">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${asset.caption}\n\n${asset.hashtags.join(' ')}`);
                          }}
                          className="text-[10px] text-white/50 hover:text-white transition-colors"
                        >
                          copy
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
              7-day content plan · mixed post types
            </p>
            <div className="space-y-2">
              {generateContentCalendar().map((day) => (
                <div
                  key={day.day}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/[0.02]"
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-[#C17F4E] w-24">
                    {day.day}
                  </span>
                  <span className="text-sm text-white/80 flex-1">{day.idea}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                    {day.postType}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-6 max-w-md">
              Tip: post consistently at the same time daily. Instagram's algorithm rewards routine. Best times for design content: 7-9am or 7-9pm in your target timezone.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-white/10">
          <p className="text-[10px] font-mono text-white/30">
            hail mary · v1 · all images are real instod editor renders · no ai-generated visuals
          </p>
        </footer>
      </div>
    </div>
  );
}
