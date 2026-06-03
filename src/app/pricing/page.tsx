'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SiteNav from '@/components/site-nav';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sofa,
  Check,
  ChevronRight,
  ArrowLeft,
  Zap,
  Building2,
  Crown,
  Eye,
  Layout,
  GitBranch,
  Palette,
  Sparkles,
  Rocket,
  Gift,
  Star,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanData {
  name: string;
  price: number;
  description: string;
  highlight: boolean;
  cta: string;
  maxProjects: number | null;
  maxRoomsPerProject: number | null;
  maxFurniturePerRoom: number | null;
  maxRevisionSnapshots: number | null;
  maxMoodBoards: number | null;
  features: Record<string, boolean>;
}

type PlanKey = 'free' | 'pro' | 'studio';

// ─── Beta Feature List ────────────────────────────────────────────────────────

const BETA_FEATURES = [
  {
    icon: Zap,
    title: 'Unlimited Design Projects',
    desc: 'Create as many projects as you want — no limits during beta.',
    color: '#C17F4E',
  },
  {
    icon: Sofa,
    title: 'Premium Furniture & Decor',
    desc: 'Access the full furniture library with all room types and lighting moods.',
    color: '#8B7355',
  },
  {
    icon: GitBranch,
    title: 'Revision Snapshots',
    desc: 'Save multiple versions of each room to compare options side by side.',
    color: '#6B8E6B',
  },
  {
    icon: Palette,
    title: 'Mood Board Creator',
    desc: 'Build mood boards with color palettes, textures, and reference images.',
    color: '#7B6BA0',
  },
  {
    icon: Layout,
    title: '2D Floor Plan Export',
    desc: 'Generate clean top-down floor plans with measurements and labels.',
    color: '#5F8BA0',
  },
  {
    icon: Crown,
    title: 'Client Portal (Branded)',
    desc: 'Share designs with clients through a professional, branded portal.',
    color: '#A08B5F',
  },
];

// ─── Plan Card Data (what users see during beta) ─────────────────────────────

const PLAN_CARDS = [
  {
    key: 'free' as PlanKey,
    name: 'Free',
    price: 0,
    badge: null,
    description: 'Explore 3D interior design',
    cta: 'Start Designing',
    features: [
      '3D room editor',
      'Basic furniture items',
      '3 room types & 2 moods',
      'Screenshot export',
    ],
    accentColor: '#8B7355',
    borderColor: '#E2DDD4',
    bg: '#FFFFFF',
    icon: Sofa,
    iconBg: '#8B735515',
  },
  {
    key: 'pro' as PlanKey,
    name: 'Pro',
    price: 12,
    badge: 'MOST POPULAR',
    description: 'For serious designers',
    cta: 'Join Beta Access',
    features: [
      '50 projects, 10 rooms each',
      'All furniture & room types',
      'Revision snapshots',
      'Share links & exports',
      'Custom dimensions',
      'Priority rendering',
    ],
    accentColor: '#C17F4E',
    borderColor: '#C17F4E',
    bg: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8F0 100%)',
    scale: true,
    icon: Zap,
    iconBg: '#C17F4E15',
    featured: true,
  },
  {
    key: 'studio' as PlanKey,
    name: 'Studio',
    price: 29,
    badge: 'FOR PROFESSIONALS',
    description: 'For professional designers',
    cta: 'Early Access Included',
    features: [
      'Unlimited everything',
      'Client Portal (branded)',
      '2D floor plan export',
      'Cost estimator',
      'Presentation mode',
      'API access & priority support',
    ],
    accentColor: '#2D2D2D',
    borderColor: '#2D2D2D',
    bg: 'linear-gradient(180deg, #2D2D2D 0%, #1A1A1A 100%)',
    dark: true,
    icon: Crown,
    iconBg: 'rgba(255,255,255,0.1)',
  },
];

// ─── Pricing Page ─────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      {/* Navbar */}
      <SiteNav
        variant="solid"
        rightContent={
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#5A4E42' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        }
      />

      {/* Hero Section — Early Access Beta */}
      <div className="text-center pt-16 pb-8 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: '#C17F4E15' }}>
          <Rocket className="w-4 h-4" style={{ color: '#C17F4E' }} />
          <span className="text-sm font-semibold" style={{ color: '#C17F4E' }}>Early Access Beta</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Design Freely. <span style={{ color: '#C17F4E' }}>Everything is Free.</span>
        </h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: '#5A4E42' }}>
          We&apos;re currently in Early Access Beta. As one of our early users, you get{' '}
          <strong style={{ color: '#2D2D2D' }}>FREE access to all premium features</strong>{' '}
          while we gather feedback and improve the experience.
        </p>
      </div>

      {/* Beta Banner */}
      <div className="max-w-4xl mx-auto px-4 pb-10 w-full">
        <div
          className="rounded-2xl border-2 p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)',
            borderColor: '#C17F4E40',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#C17F4E' }}>
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base" style={{ color: '#2D2D2D' }}>
                Beta Launch Special: All premium features are free!
              </h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: '#5A4E42' }}>
                Every user currently receives full Pro+ features at no cost. This is a limited-time early access offer
                while we refine the product based on your feedback. Premium subscriptions are coming soon, but for now
                enjoy the full experience at no charge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Beta Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div
          className="relative rounded-2xl border-2 p-8 sm:p-10 text-center"
          style={{
            background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF8F0 100%)',
            borderColor: '#C17F4E',
            boxShadow: '0 0 30px rgba(193,127,78,0.1), 0 0 60px rgba(193,127,78,0.05)',
          }}
        >
          {/* Beta badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}>
            EARLY ACCESS BETA
          </div>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#C17F4E15' }}>
            <Gift className="w-7 h-7" style={{ color: '#C17F4E' }} />
          </div>

          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Full Access, Free During Beta
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#5A4E42' }}>
            Every feature unlocked. No credit card. No time limit.
          </p>

          <div className="my-6 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>$0</span>
            <span className="text-sm" style={{ color: '#5A4E42' }}>/beta</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-left mb-8">
            {[
              'Unlimited design projects',
              'All 30+ furniture items',
              'All 6 room types & 4 lighting moods',
              'Revision snapshots',
              'Share links & screenshot export',
              'Custom room dimensions',
              'Material & skin system',
              'Save & manage projects',
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C17F4E' }} />
                <span className="text-sm" style={{ color: '#2D2D2D' }}>{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (session) {
                router.push('/dashboard');
              } else {
                router.push('/editor');
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
          >
            {session ? 'Go to Dashboard' : 'Start Designing Free'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post-Beta Plan Preview */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            What&apos;s Coming After Beta
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#5A4E42' }}>
            These plans will launch once we exit beta. Early adopters get the best deals.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLAN_CARDS.map((plan) => {
            const isDark = (plan as any).dark;
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.key}
                className="rounded-2xl border-2 p-6 opacity-75"
                style={{
                  background: isDark ? 'linear-gradient(180deg, #3D3D3D 0%, #2D2D2D 100%)' : '#FFFFFF',
                  borderColor: isDark ? '#555' : '#E2DDD4',
                  color: isDark ? '#FFFFFF' : '#2D2D2D',
                }}
              >
                {/* Coming soon overlay */}
                <div className="text-center mb-3">
                  <span className="inline-block text-[10px] font-bold tracking-wider px-3 py-1 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#F5F0E8', color: isDark ? 'rgba(255,255,255,0.6)' : '#5A4E42' }}>
                    COMING SOON
                  </span>
                </div>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: (plan as any).iconBg }}>
                  <PlanIcon className="w-5 h-5" style={{ color: isDark ? '#D4A76A' : plan.accentColor }} />
                </div>

                <h3 className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: isDark ? '#FFFFFF' : '#2D2D2D' }}>
                  {plan.name}
                </h3>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: isDark ? '#FFFFFF' : '#2D2D2D' }}>
                    ${plan.price}
                  </span>
                  <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#5A4E42' }}>/month</span>
                </div>
                <p className="mt-2 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#5A4E42' }}>{plan.description}</p>

                <div className="my-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2DDD4' }} />

                <div className="space-y-2">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: isDark ? '#D4A76A' : plan.accentColor }} />
                      <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#5A4E42' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What You Get Section */}
      <div className="py-16 px-4" style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#C17F4E15' }}>
              <Sparkles className="w-6 h-6" style={{ color: '#C17F4E' }} />
            </div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              What You Get During Beta
            </h2>
            <p className="mt-3 text-base max-w-2xl mx-auto" style={{ color: '#5A4E42' }}>
              Full access to premium features — no credit card required, no time limit, no catches.
              We want your feedback to make this the best interior design tool possible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BETA_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border p-6 transition-all duration-200 hover:shadow-md"
                style={{ background: '#FAF8F4', borderColor: '#E2DDD4' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}15` }}
                >
                  <feat.icon className="w-5 h-5" style={{ color: feat.color }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Is It Free Section */}
      <div className="py-16 px-4" style={{ background: '#F5F0E8' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Why Is It Free?
            </h2>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#6B8E6B15' }}>
                  <Eye className="w-5 h-5" style={{ color: '#6B8E6B' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: '#2D2D2D' }}>
                    We&apos;re focused on building the best platform possible
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>
                    During beta, we&apos;re gathering feedback from real users like you to improve the experience.
                    Your designs, suggestions, and bug reports directly shape the product. Premium plans will launch
                    once we&apos;ve built something truly worth paying for.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#C17F4E15' }}>
                  <Star className="w-5 h-5" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: '#2D2D2D' }}>
                    Early Adopter Benefits
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>
                    Users who join during beta may receive exclusive discounts, extended premium access,
                    and special perks when premium plans officially launch. You&apos;re not just a user —
                    you&apos;re a founding member of our community.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#7B6BA015' }}>
                  <Rocket className="w-5 h-5" style={{ color: '#7B6BA0' }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: '#2D2D2D' }}>
                    Premium Is Coming — But Not Yet
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>
                    Premium subscriptions are coming soon, but for now enjoy the full experience at no cost.
                    We&apos;ll give you plenty of notice before any changes, and early adopters will always
                    get the best deal. Your projects and data will always remain yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 text-center" style={{ background: '#FFFFFF' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Ready to Start Designing?
          </h2>
          <p className="mt-3 text-base" style={{ color: '#5A4E42' }}>
            Join the beta and get full access to all premium features — free.
          </p>
          <button
            onClick={() => {
              if (session) {
                router.push('/dashboard');
              } else {
                router.push('/editor');
              }
            }}
            className="mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
          >
            {session ? 'Go to Dashboard' : 'Create Free Account'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20" style={{ background: '#F5F0E8' }}>
        <h2 className="text-2xl font-bold text-center mb-8 pt-12" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <Accordion type="single" collapsible className="px-6">
                {[
                  {
                    q: 'Is it really free? What\'s the catch?',
                    a: 'No catch! We\'re in Early Access Beta, which means we\'re still building and improving the product. We want real users to experience everything and give us feedback. All premium features are completely free during this period.',
                  },
                  {
                    q: 'What happens when beta ends?',
                    a: 'We\'ll give you plenty of notice before introducing paid plans. Your existing projects will always be safe, and early adopters will receive exclusive discounts and extended premium access. You won\'t lose any of your work.',
                  },
                  {
                    q: 'Do I need a credit card to sign up?',
                    a: 'No. No credit card, no payment info, no hidden charges. Just create an account and start designing.',
                  },
                  {
                    q: 'What features do I get access to?',
                    a: 'During beta, you get access to all Pro and Studio features: unlimited projects, all furniture items, revision snapshots, mood boards, share links, exports, floor plans, and more. Everything is unlocked.',
                  },
                  {
                    q: 'Can I use the 3D editor without signing up?',
                    a: 'Yes! You can start designing immediately without an account. Sign up only when you want to save your projects.',
                  },
                  {
                    q: 'What about early adopter perks?',
                    a: 'Users who join during beta will receive special benefits when premium plans launch — including extended free access, exclusive discounts, and founding member status. The earlier you join, the better the perks.',
                  },
                ].map(({ q, a }, index) => (
                  <AccordionItem
                    key={q}
                    value={`faq-${index}`}
                    className="border-b last:border-b-0"
                    style={{ borderColor: '#E2DDD4' }}
                  >
                    <AccordionTrigger
                      className="text-left text-sm font-semibold py-5 hover:no-underline"
                      style={{ color: '#2D2D2D', fontFamily: "'Outfit', sans-serif" }}
                    >
                      {q}
                    </AccordionTrigger>
                    <AccordionContent
                      className="text-sm leading-relaxed pb-5"
                      style={{ color: '#5A4E42' }}
                    >
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
      </div>
    </div>
  );
}
