'use client';

import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import {
  ArrowLeft,
  Newspaper,
  Download,
  Mail,
  Calendar,
  Image as ImageIcon,
  FileText,
  Building2,
  Sparkles,
  Camera,
  Mic,
} from 'lucide-react';

const milestones = [
  {
    date: 'Late 2025',
    title: 'Instod enters Public Beta',
    summary:
      'Browser-native 3D interior design studio opens to the public with free access to all premium features during Early Access Beta. Launches with 6 room types, 30+ furniture items, and a real-time PBR rendering engine.',
  },
  {
    date: 'Mid 2025',
    title: 'Private Beta cohort onboarded',
    summary:
      'First cohort of designers joins Instod. Feedback gathered during this phase shaped the three-mode editor workflow (Design / Measure / Advanced) and the focus-mode UX for distraction-free design.',
  },
  {
    date: 'Early 2025',
    title: 'Alpha build ships internally',
    summary:
      'Working prototype completes with furniture library, material system, revision snapshots, and four lighting mood presets.',
  },
  {
    date: '2024',
    title: 'Concept & R&D',
    summary:
      'Founding research into the gap between professional design tools (SketchUp, AutoCAD) and consumer tools (IKEA Kreativ). Decision made to build a browser-native pro-grade alternative.',
  },
];

const pressKitAssets = [
  {
    icon: ImageIcon,
    title: 'Logo & Brand Assets',
    desc: 'Instod logo in PNG, SVG, and EPS formats. Light, dark, and beta variants included.',
    items: ['logo.png', 'logo.svg', 'logo-dark.svg', 'icon-150x185.png'],
  },
  {
    icon: Camera,
    title: 'Product Screenshots',
    desc: 'High-resolution screenshots of the editor, gallery samples, and dashboard UI.',
    items: ['hero-living-room.png', 'hero-bedroom.png', 'hero-kitchen.png', 'editor-screenshot.png'],
  },
  {
    icon: FileText,
    title: 'Company Boilerplate',
    desc: 'One-paragraph and one-line company descriptions for use in articles and listings.',
    items: ['boilerplate.txt', 'company-fact-sheet.pdf'],
  },
];

const factSheet = [
  { label: 'Founded', value: '2024' },
  { label: 'Headquarters', value: 'Remote-first' },
  { label: 'Founder', value: 'Muhammad Saadi' },
  { label: 'Stage', value: 'Early Access Beta' },
  { label: 'Platform', value: 'Web (browser-native)' },
  { label: 'Pricing', value: 'Free during beta; Pro $12/mo, Studio $29/mo post-beta' },
];

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      <SiteNav
        variant="solid"
        rightContent={
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#5A4E42' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        }
      />

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <Newspaper className="w-4 h-4" style={{ color: '#7A6E62' }} />
            <span className="text-sm font-semibold" style={{ color: '#7A6E62' }}>Press &amp; Newsroom</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Instod in the News
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#5A4E42' }}>
            Resources for journalists, analysts, and partners covering Instod and the browser-native 3D design space.
            Download brand assets, read our latest announcements, or get in touch with our team.
          </p>
        </div>

        {/* Press Contact Banner */}
        <div
          className="rounded-2xl border-2 p-6 sm:p-8 mb-16"
          style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)', borderColor: '#E8DFD4' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F0E8D8' }}>
              <Mic className="w-6 h-6" style={{ color: '#7A6E62' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1" style={{ color: '#2D2D2D' }}>
                Press &amp; Media Inquiries
              </h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#5A4E42' }}>
                For interviews, expert commentary on proptech / 3D design tools, or product demos,
                reach out and we&apos;ll respond within one business day.
              </p>
              <Link
                href="/contact?subject=Press%20Inquiry"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
              >
                <Mail className="w-4 h-4" />
                Contact Press Team
              </Link>
            </div>
          </div>
        </div>

        {/* Fact Sheet */}
        <div className="rounded-2xl border p-8 mb-16" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <Building2 className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Company Fact Sheet</h2>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {factSheet.map(({ label, value }) => (
              <div key={label} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-3 border-b" style={{ borderColor: '#F0E8D8' }}>
                <dt className="text-xs font-bold tracking-wider uppercase" style={{ color: '#7A6E62' }}>{label}</dt>
                <dd className="text-sm font-medium sm:text-right" style={{ color: '#2D2D2D' }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Press Kit */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <Download className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Press Kit</h2>
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#5A4E42' }}>
            Brand assets, screenshots, and company boilerplate — free to use in editorial coverage of Instod.
            For commercial use beyond editorial, please contact us first.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {pressKitAssets.map(({ icon: Icon, title, desc, items }) => (
              <div key={title} className="rounded-2xl border p-6 flex flex-col" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#FAF8F4' }}>
                  <Icon className="w-5 h-5" style={{ color: '#7A6E62' }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: '#2D2D2D' }}>{title}</h3>
                <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: '#5A4E42' }}>{desc}</p>
                <ul className="space-y-1 mb-4">
                  {items.map((item) => (
                    <li key={item} className="text-xs font-mono" style={{ color: '#7A6E62' }}>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?subject=Press%20Kit%20Request"
                  className="text-xs font-semibold inline-flex items-center gap-1.5 transition-colors hover:underline"
                  style={{ color: '#C17F4E' }}
                >
                  Request assets
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Company Milestones */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <Calendar className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Company Milestones</h2>
          </div>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-full inline-block" style={{ background: '#F0E8D8', color: '#7A6E62' }}>
                      {m.date}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-2" style={{ color: '#2D2D2D' }}>{m.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>{m.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boilerplate */}
        <div className="rounded-2xl border p-8 mb-16" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>About Instod (Boilerplate)</h2>
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#5A4E42' }}>
            <strong style={{ color: '#2D2D2D' }}>Instod</strong> is a browser-native 3D interior design studio that lets anyone
            visualize, iterate, and share room designs in real time — no installs, no GPU requirements, no design degree required.
            Built on Three.js and WebGL, Instod brings desktop-class rendering to any modern browser, bridging the gap between
            professional tools like SketchUp and consumer tools like IKEA Kreativ. Founded in 2024 by Muhammad Saadi, Instod
            is currently in Early Access Beta with all premium features available for free while the product is shaped by its
            community of early adopters.
          </p>
          <p className="text-xs italic" style={{ color: '#7A6E62' }}>
            For inquiries, visit instod.vercel.app/contact or reach out via the Press Contact form above.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border-2 p-8" style={{ background: '#FAF8F4', borderColor: '#E8DFD4' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Want to see Instod in action?
          </h2>
          <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: '#5A4E42' }}>
            Open the editor right in your browser — no signup required. Or schedule a guided demo with our team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/editor"
              prefetch={false}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              Try the Editor
            </Link>
            <Link
              href="/contact?subject=Demo%20Request"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-sm"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-8 text-center border-t" style={{ borderColor: '#E2DDD4' }}>
        <p className="text-sm" style={{ color: '#5A4E42' }}>
          &copy; {new Date().getFullYear()} Instod. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
