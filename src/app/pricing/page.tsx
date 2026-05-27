'use client';

import Link from 'next/link';
import { Sofa, Check, ChevronRight, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out 3D interior design',
    features: [
      'Full 3D room editor',
      '30+ furniture items',
      '5 room types',
      '4 lighting moods',
      'Material & color system',
      'Screenshot export',
      'Up to 3 saved designs',
    ],
    cta: 'Start for Free',
    href: '/editor',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious designers and homeowners',
    features: [
      'Everything in Free',
      'Unlimited saved designs',
      'Multiple rooms per project',
      'Share links for viewing',
      'Priority rendering',
      'Custom room dimensions',
      'Export as image or PDF',
      'Email support',
    ],
    cta: 'Get Pro',
    href: '/auth/signup',
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$29',
    period: '/month',
    description: 'For professional interior designers',
    features: [
      'Everything in Pro',
      'Unlimited projects',
      'Client sharing & feedback',
      'Brand customization',
      'API access',
      'Team collaboration',
      'Priority support',
      'Custom furniture uploads',
    ],
    cta: 'Contact Sales',
    href: '/auth/signup',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      {/* Navbar */}
      <nav className="border-b" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#C17F4E' }}>
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Interior Studio</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#8A8478' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#8A8478' }}>
          Start designing for free. Upgrade when you need more power.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl border-2 p-8 transition-all duration-200 hover:shadow-lg"
              style={{
                background: '#FFFFFF',
                borderColor: plan.highlight ? '#C17F4E' : '#E2DDD4',
                transform: plan.highlight ? 'scale(1.02)' : 'none',
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#C17F4E' }}>
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>{plan.price}</span>
                <span className="text-sm" style={{ color: '#8A8478' }}>{plan.period}</span>
              </div>
              <p className="mt-2 text-sm" style={{ color: '#8A8478' }}>{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C17F4E' }} />
                    <span className="text-sm" style={{ color: '#2D2D2D' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.href}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: plan.highlight ? 'linear-gradient(135deg, #C17F4E, #A86A3D)' : 'transparent',
                  color: plan.highlight ? '#FFFFFF' : '#C17F4E',
                  border: plan.highlight ? 'none' : '2px solid #C17F4E',
                }}
              >
                {plan.cta}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I use the 3D editor for free?', a: 'Yes! The free plan gives you full access to the 3D editor, all furniture items, and room types. You can design without any time limit.' },
              { q: 'What counts as a saved design?', a: 'A saved design is a complete room layout stored in your account. Free users can save up to 3 designs, while Pro and Studio have unlimited saves.' },
              { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. You can cancel your Pro or Studio subscription at any time. You will retain access until the end of your billing period.' },
              { q: 'Do I need to sign up to try the editor?', a: 'No sign-up is required to use the 3D editor. You can start designing immediately. Sign up only when you want to save your work.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
                <h4 className="font-semibold text-sm" style={{ color: '#2D2D2D' }}>{q}</h4>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#8A8478' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
