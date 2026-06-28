'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ROOM_IMAGES, POST_TYPES, TONES, RoomImage, PostType, Tone } from '@/lib/hail-mary-images';
import { generateContentCalendar } from '@/lib/hail-mary-templates';

const PASSWORD = '123';
const SESSION_KEY = 'hail-mary-unlocked';

interface CapturedImage {
  dataUrl: string;
  view: string;
  mood: string;
  label: string;
}

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
  imageDataUrl?: string;
  imageSrc?: string;
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
        style={{ background: '#0A0A0A', fontFamily: "'Inter', sans-serif" }}
      >
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs px-6">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            autoFocus
            placeholder="•"
            className={`w-full bg-transparent text-center text-3xl tracking-[0.5em] font-mono outline-none border-b-2 transition-colors py-3 ${passwordError ? 'border-red-500 text-red-400' : 'border-white/20 text-white focus:border-white/60'}`}
            style={{ caretColor: '#C17F4E' }}
            aria-label="Access code"
          />
          {passwordError && <p className="text-center text-xs text-red-400 mt-3 font-mono">access denied</p>}
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
  const [activeTab, setActiveTab] = useState<'generate' | 'capture' | 'library' | 'calendar'>('generate');
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Live capture state
  const [captureMode, setCaptureMode] = useState<'idle' | 'connecting' | 'connected' | 'capturing' | 'done'>('idle');
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [activeCapture, setActiveCapture] = useState<CapturedImage | null>(null);
  const editorIframeRef = useRef<HTMLIFrameElement>(null);
  const captureMsgIdRef = useRef(0);

  // Instagram preview
  const [showPreview, setShowPreview] = useState(false);

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
      if (typeof window !== 'undefined') localStorage.setItem('hail-mary-assets', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleGenerate = async (imageSrc?: string, pType?: PostType, t?: Tone) => {
    const src = imageSrc || selectedImage.src;
    const pt = pType || postType;
    const tn = t || tone;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/hail-mary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageSrc: src, postType: pt, tone: tn }),
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
    await handleGenerate(randomImage.src, randomType.value, randomTone.value);
  };

  // ── Live Capture ──────────────────────────────────────────────────────
  const openEditorForCapture = () => {
    setCaptureMode('connecting');
    setCapturedImages([]);
    setActiveCapture(null);
  };

  // Listen for messages from the editor iframe
  useEffect(() => {
    if (captureMode === 'idle') return;
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type } = event.data || {};

      if (type === 'hail-mary:editor-ready') {
        setCaptureMode('connected');
      }

      if (type === 'hail-mary:capture-all-response') {
        const captures = event.data.captures as CapturedImage[] || [];
        setCapturedImages(captures);
        if (captures.length > 0) setActiveCapture(captures[0]);
        setCaptureMode('done');
      }

      if (type === 'hail-mary:set-view-response') {
        const data = event.data;
        const img: CapturedImage = {
          dataUrl: data.dataUrl,
          view: data.view,
          mood: data.mood || 'daylight',
          label: `${data.view || '3D'} · ${data.mood || 'daylight'}`,
        };
        setCapturedImages((prev) => [...prev, img]);
        setActiveCapture(img);
      }

      if (type === 'hail-mary:set-mood-response') {
        const data = event.data;
        const img: CapturedImage = {
          dataUrl: data.dataUrl,
          view: 'current',
          mood: data.mood,
          label: `Current view · ${data.mood}`,
        };
        setCapturedImages((prev) => [...prev, img]);
        setActiveCapture(img);
      }

      if (type === 'hail-mary:screenshot-response') {
        const data = event.data;
        const img: CapturedImage = {
          dataUrl: data.dataUrl,
          view: 'current',
          mood: 'current',
          label: 'Quick capture',
        };
        setCapturedImages((prev) => [...prev, img]);
        setActiveCapture(img);
        setCaptureMode('done');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [captureMode]);

  const sendToEditor = (msg: Record<string, unknown>) => {
    if (!editorIframeRef.current?.contentWindow) return;
    captureMsgIdRef.current++;
    editorIframeRef.current.contentWindow.postMessage({ ...msg, id: captureMsgIdRef.current }, window.location.origin);
  };

  const captureAllAngles = () => {
    setCaptureMode('capturing');
    setCapturedImages([]);
    sendToEditor({ type: 'hail-mary:capture-all' });
  };

  const captureQuick = () => {
    setCaptureMode('capturing');
    sendToEditor({ type: 'hail-mary:screenshot' });
  };

  const captureView = (view: 'top' | 'front' | 'persp') => {
    setCaptureMode('capturing');
    sendToEditor({ type: 'hail-mary:set-view', view });
  };

  const captureMood = (mood: string) => {
    setCaptureMode('capturing');
    sendToEditor({ type: 'hail-mary:set-mood', mood });
  };

  // Use captured image as source for content generation
  const useCaptureForPost = (img: CapturedImage) => {
    setActiveCapture(img);
    // Find closest room image for metadata
    const closest = ROOM_IMAGES.find((r) => r.roomType === 'living') || ROOM_IMAGES[0];
    setSelectedImage(closest);
    setActiveTab('generate');
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
      imageDataUrl: activeCapture?.dataUrl,
      imageSrc: !activeCapture ? content.image.src : undefined,
      imageLabel: activeCapture?.label || content.image.label,
      postType,
      tone,
      caption: content.captions[0],
      hashtags: content.hashtags,
      createdAt: new Date().toISOString(),
    };
    saveAsset(asset);
  };

  const downloadImage = (dataUrl?: string, src?: string) => {
    const link = document.createElement('a');
    if (dataUrl) {
      link.href = dataUrl;
      link.download = `instod-capture-${Date.now()}.png`;
    } else if (src) {
      link.href = src;
      link.download = `instod-${selectedImage.roomType}-${Date.now()}.webp`;
    }
    link.click();
  };

  // Get the current display image (captured or pre-saved)
  const currentImageDataUrl = activeCapture?.dataUrl;

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
              <span className="text-sm font-bold">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Hail Mary</h1>
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">content studio · private</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Instagram Preview toggle */}
            {(currentImageDataUrl || content) && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-mono text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded border border-white/10"
              >
                {showPreview ? '✕ close preview' : '📱 Instagram preview'}
              </button>
            )}
            <a href="/" className="text-xs font-mono text-white/40 hover:text-white/70 transition-colors">← exit</a>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex items-center gap-1 mb-8 border-b border-white/10">
          {[
            { id: 'generate' as const, label: 'Generate', icon: '✨' },
            { id: 'capture' as const, label: 'Live Capture', icon: '📸' },
            { id: 'library' as const, label: `Library${savedAssets.length > 0 ? ` (${savedAssets.length})` : ''}`, icon: '📁' },
            { id: 'calendar' as const, label: 'Calendar', icon: '📅' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#C17F4E' }} />}
            </button>
          ))}
        </nav>

        {/* ── Generate Tab ──────────────────────────────────────── */}
        {activeTab === 'generate' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Controls */}
            <div className="space-y-6">
              <button
                onClick={handleSurpriseMe}
                disabled={generating}
                className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)', boxShadow: generating ? '0 0 30px rgba(193,127,78,0.4)' : 'none' }}
              >
                {generating ? (
                  <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-white animate-pulse" />generating...</span>
                ) : '🎲 Surprise Me — one click, full post'}
              </button>

              {/* Image picker */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 block">01 · pick a room</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ROOM_IMAGES.map((img) => (
                    <button
                      key={img.src}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all ${selectedImage.src === img.src ? 'ring-2 ring-[#C17F4E] ring-offset-2 ring-offset-[#0A0A0A]' : 'opacity-60 hover:opacity-100'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-2">{selectedImage.label} · {selectedImage.mood}</p>
              </div>

              {/* Post type */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 block">02 · post type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POST_TYPES.map((pt) => (
                    <button key={pt.value} onClick={() => setPostType(pt.value)} className={`p-3 rounded-lg text-left transition-all border ${postType === pt.value ? 'border-[#C17F4E] bg-[#C17F4E]/10' : 'border-white/10 hover:border-white/30'}`}>
                      <div className="text-lg mb-1">{pt.icon}</div>
                      <div className="text-xs font-semibold">{pt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 block">03 · tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button key={t.value} onClick={() => setTone(t.value)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${tone === t.value ? 'border-[#C17F4E] bg-[#C17F4E]/10 text-white' : 'border-white/10 text-white/50 hover:text-white/80'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => handleGenerate()} disabled={generating} className="w-full py-3 rounded-xl font-semibold text-sm border border-white/20 text-white transition-all hover:bg-white/5 disabled:opacity-50">
                {generating ? 'Generating...' : 'Generate Content →'}
              </button>
            </div>

            {/* Right: Output */}
            <div className="space-y-4">
              {/* Image preview — show captured image or pre-saved */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-white/5">
                {currentImageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentImageDataUrl} alt="Captured from editor" className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedImage.src} alt={selectedImage.label} className="w-full h-full object-cover" />
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {activeCapture && (
                    <span className="px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider bg-[#C17F4E] text-white">
                      live capture
                    </span>
                  )}
                </div>
                <button
                  onClick={() => downloadImage(currentImageDataUrl, selectedImage.src)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-colors"
                >
                  ↓ Download
                </button>
              </div>

              {error && <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}

              {content && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {content.source === 'ai' ? '⚡ AI-generated' : '📝 template-based'}
                    </span>
                    <button onClick={handleSaveAsset} className="text-xs text-white/50 hover:text-white transition-colors">+ save to library</button>
                  </div>

                  {postType !== 'reel-script' && (
                    <div className="space-y-3">
                      {content.captions.map((caption, i) => (
                        <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/[0.03]">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">variant {i + 1}</span>
                            <button onClick={() => copyToClipboard(caption, `caption-${i}`)} className="text-xs text-white/50 hover:text-white transition-colors">
                              {copiedField === `caption-${i}` ? '✓ copied' : 'copy'}
                            </button>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">{caption}</p>
                        </div>
                      ))}
                    </div>
                  )}

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
                            <p className="text-xs text-white/90 mb-1"><span className="text-white/40">visual:</span> {shot.visual}</p>
                            <p className="text-xs text-white/90 mb-1"><span className="text-white/40">voiceover:</span> {shot.voiceover}</p>
                            <p className="text-xs text-white/90"><span className="text-white/40">text overlay:</span> {shot.textOverlay}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-lg border border-white/10 bg-white/[0.03]">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">music</p>
                        <p className="text-xs text-white/90">{content.reelScript.music}</p>
                      </div>
                    </div>
                  )}

                  {content.hashtags.length > 0 && (
                    <div className="p-4 rounded-lg border border-white/10 bg-white/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">hashtags ({content.hashtags.length})</span>
                        <button onClick={() => copyToClipboard(content.hashtags.join(' '), 'hashtags')} className="text-xs text-white/50 hover:text-white transition-colors">
                          {copiedField === 'hashtags' ? '✓ copied' : 'copy all'}
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-white/70 break-words">{content.hashtags.join(' ')}</p>
                    </div>
                  )}
                </div>
              )}

              {!content && !error && !generating && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-4"><span className="text-2xl opacity-30">✨</span></div>
                  <p className="text-sm text-white/40 max-w-xs">Pick a room, choose a post type, hit generate. Or click "Surprise Me" for instant content.</p>
                  <p className="text-xs text-white/25 mt-3">💡 Use the Live Capture tab to screenshot from the real editor</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Live Capture Tab ──────────────────────────────────── */}
        {activeTab === 'capture' && (
          <div>
            {/* Not connected yet */}
            {captureMode === 'idle' && (
              <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl opacity-40">📸</span>
                </div>
                <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Live Editor Capture</h2>
                <p className="text-sm text-white/60 mb-2 leading-relaxed">
                  Open the Instod editor with capture mode enabled. Screenshot rooms at multiple angles
                  and lighting moods directly from the live 3D canvas — then use those screenshots
                  as real Instagram content.
                </p>
                <p className="text-xs text-white/30 mb-6">
                  No AI-generated images. Every capture is a real render from your editor.
                </p>
                <button
                  onClick={openEditorForCapture}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                >
                  Open Editor for Capture
                </button>
                <p className="text-[10px] font-mono text-white/20 mt-4">
                  Opens in an embedded frame. Your current design will be captured.
                </p>
              </div>
            )}

            {/* Editor iframe + capture controls */}
            {captureMode !== 'idle' && (
              <div className="space-y-4">
                {/* Status bar */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${captureMode === 'connected' ? 'bg-green-400 animate-pulse' : captureMode === 'capturing' ? 'bg-yellow-400 animate-pulse' : 'bg-white/30'}`} />
                    <span className="text-xs font-mono text-white/60">
                      {captureMode === 'connecting' && 'Connecting to editor...'}
                      {captureMode === 'connected' && 'Editor connected — ready to capture'}
                      {captureMode === 'capturing' && 'Capturing...'}
                      {captureMode === 'done' && `${capturedImages.length} captures`}
                    </span>
                  </div>
                  <button onClick={() => { setCaptureMode('idle'); setCapturedImages([]); }} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    ✕ disconnect
                  </button>
                </div>

                {/* Capture controls */}
                {captureMode === 'connected' && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={captureAllAngles} className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
                      📸 Capture All Angles
                    </button>
                    <button onClick={captureQuick} className="px-4 py-2.5 rounded-lg text-xs font-medium border border-white/20 text-white/80 hover:bg-white/5 transition-all">
                      Quick Screenshot
                    </button>
                    <div className="w-px h-8 bg-white/10 self-center" />
                    <span className="text-[10px] font-mono text-white/30 self-center">VIEWS:</span>
                    {(['persp', 'front', 'top'] as const).map((v) => (
                      <button key={v} onClick={() => captureView(v)} className="px-3 py-2 rounded-lg text-xs font-medium border border-white/10 text-white/60 hover:text-white/90 hover:border-white/30 transition-all">
                        {v === 'persp' ? '3D' : v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                    <div className="w-px h-8 bg-white/10 self-center" />
                    <span className="text-[10px] font-mono text-white/30 self-center">MOOD:</span>
                    {(['daylight', 'golden', 'evening', 'night'] as const).map((m) => (
                      <button key={m} onClick={() => captureMood(m)} className="px-3 py-2 rounded-lg text-xs font-medium border border-white/10 text-white/60 hover:text-white/90 hover:border-white/30 transition-all capitalize">
                        {m}
                      </button>
                    ))}
                  </div>
                )}

                {/* Editor iframe */}
                <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: '480px' }}>
                  <iframe
                    ref={editorIframeRef}
                    src={`/editor?capture=true`}
                    className="w-full h-full border-0"
                    title="Instod Editor — Capture Mode"
                    allow="clipboard-write"
                  />
                  {/* Capturing overlay */}
                  {captureMode === 'capturing' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full bg-[#C17F4E] animate-pulse" />
                        <span className="text-sm font-medium">Capturing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Captured images grid */}
                {capturedImages.length > 0 && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3">
                      captures ({capturedImages.length})
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {capturedImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveCapture(img)}
                          className={`relative aspect-square rounded-lg overflow-hidden transition-all ${activeCapture === img ? 'ring-2 ring-[#C17F4E] ring-offset-2 ring-offset-[#0A0A0A]' : 'opacity-70 hover:opacity-100'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.dataUrl} alt={img.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    {activeCapture && (
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => useCaptureForPost(activeCapture)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                        >
                          ✨ Use this for a post
                        </button>
                        <button
                          onClick={() => downloadImage(activeCapture.dataUrl)}
                          className="px-4 py-2 rounded-lg text-xs font-medium border border-white/20 text-white/70 hover:text-white transition-all"
                        >
                          ↓ Download PNG
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Library Tab ───────────────────────────────────────── */}
        {activeTab === 'library' && (
          <div>
            {savedAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center mb-4"><span className="text-2xl opacity-30">📁</span></div>
                <p className="text-sm text-white/40">No saved assets yet. Generate content and click &quot;save to library&quot;.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedAssets.map((asset) => (
                  <div key={asset.id} className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                    <div className="aspect-video relative">
                      {asset.imageDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={asset.imageDataUrl} alt={asset.imageLabel} className="w-full h-full object-cover" />
                      ) : asset.imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={asset.imageSrc} alt={asset.imageLabel} className="w-full h-full object-cover" />
                      ) : null}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-black/70 text-white">
                        {asset.imageDataUrl ? 'live capture' : asset.postType}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-white/90 line-clamp-3 mb-2">{asset.caption}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/30">{new Date(asset.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => navigator.clipboard.writeText(`${asset.caption}\n\n${asset.hashtags.join(' ')}`)} className="text-[10px] text-white/50 hover:text-white transition-colors">copy</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Calendar Tab ──────────────────────────────────────── */}
        {activeTab === 'calendar' && (
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">7-day content plan · mixed post types</p>
            <div className="space-y-2">
              {generateContentCalendar().map((day) => (
                <div key={day.day} className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#C17F4E] w-24">{day.day}</span>
                  <span className="text-sm text-white/80 flex-1">{day.idea}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">{day.postType}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-6 max-w-md">
              Tip: post consistently at the same time daily. Instagram&apos;s algorithm rewards routine. Best times for design content: 7-9am or 7-9pm in your target timezone.
            </p>
          </div>
        )}

        {/* ── Instagram Preview Modal ───────────────────────────── */}
        {showPreview && (currentImageDataUrl || content) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-[#1A1A1A] rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl">
              {/* Instagram header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
                  <span className="text-xs font-bold">I</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">instod.design</p>
                  <p className="text-[10px] text-white/50">Sponsored</p>
                </div>
              </div>
              {/* Image */}
              <div className="aspect-square bg-white/5">
                {currentImageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentImageDataUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : selectedImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedImage.src} alt="Preview" className="w-full h-full object-cover" />
                ) : null}
              </div>
              {/* Instagram actions */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-4 text-white/60">
                  <span>♥</span><span>💬</span><span>📤</span><span className="ml-auto">🔖</span>
                </div>
                {content?.captions[0] && (
                  <p className="text-xs leading-relaxed text-white/80 line-clamp-5">
                    <strong>instod.design</strong> {content.captions[0].substring(0, 200)}...
                  </p>
                )}
                {content?.hashtags.length > 0 && (
                  <p className="text-[10px] text-white/40 line-clamp-2">{content.hashtags.slice(0, 8).join(' ')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-white/10">
          <p className="text-[10px] font-mono text-white/30">hail mary · v2 · live capture from real editor · no ai-generated visuals</p>
        </footer>
      </div>
    </div>
  );
}
