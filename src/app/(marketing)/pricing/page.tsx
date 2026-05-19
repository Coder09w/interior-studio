'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Sofa,
  Check,
  X,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ─── Navbar (same as landing) ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: '#C17F4E' }}
            >
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              Interior Studio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm font-medium transition-colors hover:text-[#C17F4E]"
              style={{ color: '#8A8478' }}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-[#C17F4E]"
              style={{ color: '#C17F4E' }}
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium px-5 py-2.5 rounded-lg border transition-all hover:shadow-sm"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: '#C17F4E' }}
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#2D2D2D' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden bg-white/95 backdrop-blur-md border-t"
          style={{ borderColor: '#E2DDD4' }}
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/#features"
              className="block text-sm font-medium py-2"
              style={{ color: '#8A8478' }}
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block text-sm font-medium py-2"
              style={{ color: '#C17F4E' }}
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium px-5 py-2.5 rounded-lg border text-center"
                style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm font-medium px-5 py-2.5 rounded-lg text-white text-center"
                style={{ background: '#C17F4E' }}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Pricing Card ─── */
interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
  filled?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Interior Studio.',
    features: [
      { text: '3 saved designs', included: true },
      { text: '1 project', included: true },
      { text: '15 furniture pieces', included: true },
      { text: 'Basic room settings', included: true },
      { text: 'No export', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/auth/signup',
    filled: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For designers who need unlimited creative freedom.',
    features: [
      { text: 'Unlimited designs', included: true },
      { text: 'Unlimited projects & rooms', included: true },
      { text: 'All 30+ furniture items', included: true },
      { text: 'Advanced room settings', included: true },
      { text: 'Screenshot export', included: true },
      { text: 'PDF floor plan export', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/auth/signup',
    popular: true,
    filled: true,
  },
  {
    name: 'Studio',
    price: '$29',
    period: '/month',
    description: 'For teams and professionals with advanced needs.',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team sharing', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom branding on exports', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/auth/signup',
    filled: false,
  },
];

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        plan.popular ? 'scale-[1.02] md:scale-105 z-10' : ''
      }`}
      style={{
        background: '#FFFFFF',
        borderColor: plan.popular ? '#C17F4E' : '#E2DDD4',
        borderWidth: plan.popular ? '2px' : '1px',
      }}
    >
      {plan.popular && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white border-0 px-4 py-1 text-xs font-semibold"
          style={{ background: '#C17F4E' }}
        >
          Most Popular
        </Badge>
      )}

      <div className="mb-6">
        <h3
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
        >
          {plan.name}
        </h3>
        <p className="text-sm" style={{ color: '#8A8478' }}>
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <span
          className="text-4xl sm:text-5xl font-extrabold"
          style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
        >
          {plan.price}
        </span>
        <span className="text-sm ml-1" style={{ color: '#8A8478' }}>
          {plan.period}
        </span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map(({ text, included }) => (
          <li key={text} className="flex items-start gap-3">
            {included ? (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(193,127,78,0.12)' }}
              >
                <Check className="w-3 h-3" style={{ color: '#C17F4E' }} />
              </div>
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#F5F0E8' }}
              >
                <X className="w-3 h-3" style={{ color: '#8A8478' }} />
              </div>
            )}
            <span
              className={`text-sm ${included ? '' : 'line-through'}`}
              style={{ color: included ? '#2D2D2D' : '#8A8478' }}
            >
              {text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaLink}
        className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md ${
          plan.filled
            ? 'text-white hover:opacity-90'
            : 'border-2 hover:bg-[#F5F0E8]'
        }`}
        style={{
          background: plan.filled ? '#C17F4E' : 'transparent',
          borderColor: plan.filled ? 'transparent' : '#E2DDD4',
          color: plan.filled ? '#FFFFFF' : '#2D2D2D',
        }}
      >
        {plan.cta}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ─── FAQ ─── */
const faqs = [
  {
    q: 'Can I try Interior Studio for free?',
    a: 'Absolutely! Our Free plan lets you create up to 3 designs with 15 furniture pieces. No credit card required to get started.',
  },
  {
    q: 'What happens when I upgrade to Pro?',
    a: 'You get instant access to all 30+ furniture items, unlimited projects, advanced room settings, and export capabilities. Your existing designs carry over seamlessly.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period. No cancellation fees.',
  },
  {
    q: 'Is there a team or enterprise plan?',
    a: 'Our Studio plan includes team sharing, custom branding, and API access. For larger organizations with specific needs, please contact our sales team for a custom plan.',
  },
  {
    q: 'Do I need design experience to use Interior Studio?',
    a: 'Not at all! Interior Studio is designed for everyone, from professional designers to first-time homeowners. Our intuitive drag-and-drop interface makes it easy to create beautiful designs.',
  },
];

function FAQSection() {
  return (
    <section className="py-20 sm:py-28" style={{ background: '#FFFFFF' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base" style={{ color: '#8A8478' }}>
            Everything you need to know about Interior Studio.
          </p>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-6"
          style={{ borderColor: '#E2DDD4', background: '#FAF8F4' }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b last:border-b-0"
                style={{ borderColor: '#E2DDD4' }}
              >
                <AccordionTrigger
                  className="text-left text-sm sm:text-base font-medium py-4"
                  style={{ color: '#2D2D2D' }}
                >
                  {q}
                </AccordionTrigger>
                <AccordionContent
                  className="text-sm leading-relaxed"
                  style={{ color: '#8A8478' }}
                >
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer (same as landing) ─── */
function Footer() {
  return (
    <footer style={{ background: '#2D2D2D' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#C17F4E' }}
              >
                <Sofa className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Interior Studio
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              The easiest way to design, visualize, and share your dream
              interiors in stunning 3D.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5">
              {['Features', 'Pricing', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Pricing' ? '/pricing' : item === 'Features' ? '/#features' : '#'}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5">
              {['About', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 border-t text-center"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Interior Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32">
        {/* Header */}
        <section className="py-12 sm:py-16 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}
            >
              Simple, Transparent{' '}
              <span style={{ color: '#C17F4E' }}>Pricing</span>
            </h1>
            <p
              className="mt-4 text-base sm:text-lg"
              style={{ color: '#8A8478' }}
            >
              Choose the plan that&apos;s right for you. No hidden fees, no
              surprises.
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-20 sm:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
              {plans.map((plan) => (
                <PricingCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
