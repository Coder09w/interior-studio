'use client';

import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import {
  ArrowLeft,
  ArrowRight,
  Sofa,
  Bed,
  Briefcase,
  Clock,
  Check,
  Sparkles,
  Camera,
} from 'lucide-react';

interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  category: string;
  duration: string;
  heroImage: string;
  heroAlt: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  features: string[];
  accentColor: string;
  icon: typeof Sofa;
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'modern-living-room',
    title: 'Modern Living Room Refresh for a First-Time Homeowner',
    client: 'Residential client — Karachi, PK',
    category: 'Residential',
    duration: '2 design sessions, ~3 hours total',
    heroImage: '/images/hero-living-v2.webp',
    heroAlt: '3D render of a modern living room designed in Instod with sofa, coffee table, and warm lighting',
    challenge:
      'A first-time homeowner wanted to visualize how a sectional sofa, accent chair, and media console would fit together in an oddly-proportioned 4.5m × 3.8m living room before committing to furniture purchases. SketchUp felt too complex, and consumer apps could not handle the custom dimensions or lighting conditions of the actual apartment.',
    solution:
      'Using Instod, the designer recreated the room to exact dimensions, dropped in furniture from the preset library, swapped material finishes (walnut, oak, brushed metal) in real time, and walked the client through four lighting moods to compare daytime vs. evening ambience. Two revision snapshots were saved so the client could A/B test a warmer vs. cooler palette side by side.',
    outcomes: [
      'Client approved the design in a single 90-minute remote session',
      'Furniture order placed with confidence — zero returns or exchanges',
      'Designer saved the project as a reusable template for similar-sized rooms',
      'Total billable time cut by ~40% vs. a SketchUp-based workflow',
    ],
    features: ['Custom dimensions', 'Revision snapshots', 'Lighting moods', 'Material swap', 'Share link'],
    accentColor: '#C17F4E',
    icon: Sofa,
  },
  {
    slug: 'studio-apartment-bedroom',
    title: 'Maximizing a 14m² Studio Apartment Bedroom',
    client: 'Interior design studio — remote collaboration',
    category: 'Small space',
    duration: '1 design session, ~75 minutes',
    heroImage: '/images/hero-bedroom-v2.webp',
    heroAlt: '3D render of a compact bedroom layout designed in Instod showing space-efficient furniture placement',
    challenge:
      'A studio needed to present three layout options to a client moving into a 14m² studio apartment. The constraints were tight: a queen bed, wardrobe, work desk, and storage all had to fit without the room feeling cramped. The studio previously relied on static floor plans and Pinterest mood boards, which failed to communicate spatial feel.',
    solution:
      'The designer built the room in Instod using the exact apartment dimensions, then created three variations — each saved as a revision snapshot. The Top view was used to verify circulation paths and clearance, while the 3D view sold the spatial feel. A shareable link was sent to the client, who could orbit, zoom, and toggle between the three options without installing anything.',
    outcomes: [
      'Three layout options presented in a single shareable link',
      'Client picked Option B within 24 hours — no follow-up meeting needed',
      'Studio eliminated one round of in-person presentation (~2 hours saved)',
      'Share link reused in the studio\'s portfolio and on social media',
    ],
    features: ['Top view', 'Revision snapshots', 'Share link', 'Mobile-friendly viewer', 'Custom dimensions'],
    accentColor: '#8B7355',
    icon: Bed,
  },
  {
    slug: 'functional-home-office',
    title: 'Functional Home Office for a Remote-First Consultant',
    client: 'Solo consultant — upgraded from spare bedroom',
    category: 'Home office',
    duration: '2 design sessions, ~2.5 hours total',
    heroImage: '/images/hero-office-v2.webp',
    heroAlt: '3D render of a home office designed in Instod with desk, shelving, and task lighting',
    challenge:
      'A remote-first consultant was converting a spare bedroom into a permanent home office and needed to balance video-call aesthetics, storage for books and equipment, and ergonomic desk placement against a window with strong afternoon sun. The client wanted to validate the layout before ordering a $2,400 sit-stand desk and matching shelving system.',
    solution:
      'The designer recreated the room in Instod, positioned the desk to face the door (better for video calls) while avoiding direct backlight from the window, and tested four lighting moods to verify how the space would look on camera. Material finishes on the shelving were swapped between oak and white lacquer to compare against existing flooring. The focus mode was used to capture clean screenshots for the client.',
    outcomes: [
      'Desk and shelving ordered on the first try — no layout-related returns',
      'Lighting verified for video calls before purchase (no awkward shadows)',
      'Designer produced before/after screenshots for the client\'s portfolio',
      'Project reused as a template for two subsequent home-office clients',
    ],
    features: ['Focus mode', 'Lighting moods', 'Material swap', 'Screenshot export', 'Share link'],
    accentColor: '#6B8E6B',
    icon: Briefcase,
  },
];

export default function CaseStudiesPage() {
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

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(0,0,0,0.05)' }}>
            <Camera className="w-4 h-4" style={{ color: '#7A6E62' }} />
            <span className="text-sm font-semibold" style={{ color: '#7A6E62' }}>Case Studies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Real Designs. Real Outcomes.
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#5A4E42' }}>
            See how designers are using Instod to ship projects faster, present options more clearly,
            and eliminate the costly back-and-forth of furniture returns and layout revisions.
            Each case study below was designed end-to-end in the browser — no installs, no plugins.
          </p>
        </div>

        {/* Case Study Cards */}
        <div className="space-y-16 mb-16">
          {caseStudies.map((cs, index) => {
            const Icon = cs.icon;
            return (
              <article
                key={cs.slug}
                className="rounded-3xl border overflow-hidden"
                style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}
              >
                {/* Hero image */}
                <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden" style={{ background: '#1A1A1A' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cs.heroImage}
                    alt={cs.heroAlt}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                  <div
                    className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', backdropFilter: 'blur(8px)' }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: cs.accentColor }} />
                    {cs.category.toUpperCase()}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-10">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                    {cs.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm" style={{ color: '#7A6E62' }}>
                    <span className="font-medium">{cs.client}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {cs.duration}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: cs.accentColor }}>
                        Challenge
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>{cs.challenge}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: cs.accentColor }}>
                        Solution
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>{cs.solution}</p>
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div className="rounded-2xl p-5 mb-6" style={{ background: '#FAF8F4' }}>
                    <h3 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: cs.accentColor }}>
                      Outcomes
                    </h3>
                    <ul className="space-y-2">
                      {cs.outcomes.map((o, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6B8B5E' }} />
                          <span className="text-sm leading-relaxed" style={{ color: '#2D2D2D' }}>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features used */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold tracking-wider uppercase mr-2" style={{ color: '#7A6E62' }}>
                      Instod features used:
                    </span>
                    {cs.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: `${cs.accentColor}15`, color: cs.accentColor }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="text-center rounded-3xl border-2 p-8 sm:p-12"
          style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)', borderColor: '#E8DFD4' }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#F0E8D8' }}>
            <Sparkles className="w-7 h-7" style={{ color: '#7A6E62' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Your next project could be next.
          </h2>
          <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: '#5A4E42' }}>
            Open the Instod editor and start designing in your browser — no signup, no install.
            Save your work with a free account whenever you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/editor"
              prefetch={false}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              Open the Editor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-sm"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
            >
              See Pricing
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
