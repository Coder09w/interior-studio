'use client';

import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import {
  Sofa,
  Heart,
  Rocket,
  Users,
  ArrowLeft,
  Sparkles,
  Globe,
  Shield,
  Target,
  Compass,
  TrendingUp,
  Linkedin,
  Mail,
} from 'lucide-react';

export default function AboutPage() {
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
            <Sofa className="w-4 h-4" style={{ color: '#7A6E62' }} />
            <span className="text-sm font-semibold" style={{ color: '#7A6E62' }}>Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Making Interior Design <span style={{ color: '#2D2D2D', fontWeight: 800 }}>Accessible to Everyone</span>
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#5A4E42' }}>
            Instod was born from a simple idea: everyone deserves to visualize their dream space before committing to it. We believe great design shouldn&apos;t require expensive software or a professional degree.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Heart,
              title: 'Design for All',
              description: 'We remove the barriers between imagination and visualization. Our free 3D editor lets anyone design rooms with professional-quality results, right in their browser.',
              color: '#C17F4E',
            },
            {
              icon: Rocket,
              title: 'Iterate Instantly',
              description: 'No more waiting for renders or redrawing floor plans. Swap furniture, change materials, adjust lighting — see results in real-time as you design your perfect space.',
              color: '#8B7355',
            },
            {
              icon: Globe,
              title: 'Zero Installations',
              description: 'No downloads, no plugins, no compatibility issues. Instod runs entirely in your web browser using cutting-edge WebGL technology. Design from any device.',
              color: '#6B8E6B',
            },
          ].map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>{description}</p>
            </div>
          ))}
        </div>

        {/* Company Milestones */}
        <div className="rounded-2xl border p-8 mb-16" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Company Milestones</h2>
          </div>
          <div className="space-y-4">
            {[
              { date: '2024', title: 'Concept & R&D', desc: 'Initial research into browser-native 3D rendering pipelines and the gap between pro and consumer design tools.' },
              { date: 'Early 2025', title: 'Alpha Build', desc: 'First working prototype with furniture library, material system, and real-time lighting controls.' },
              { date: 'Mid 2025', title: 'Private Beta', desc: 'Onboarded first cohort of designers; collected feedback that shaped the editor\'s three-mode workflow.' },
              { date: 'Late 2025', title: 'Public Beta Launch', desc: 'Opened Instod to the public with free access to all premium features during Early Access Beta.' },
              { date: 'In Progress', title: 'AI-Powered Design Generation', desc: 'Building AI features for instant room layout suggestions and material palette generation.' },
            ].map((m, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: '#F0E8D8' }}>
                <div className="flex-shrink-0 w-24 pt-0.5">
                  <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-full inline-block" style={{ background: '#F0E8D8', color: '#7A6E62' }}>
                    {m.date}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: '#2D2D2D' }}>{m.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <Compass className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>What We Believe</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Target, title: 'Craft over hype', desc: 'We ship features that designers actually use, not checkboxes for a landing page. Every tool earns its place.' },
              { icon: Heart, title: 'Users as co-builders', desc: 'Beta feedback has shaped every major decision. Our users are not just customers — they are co-builders of Instod.' },
              { icon: Globe, title: 'Browser-native first', desc: 'The browser is the operating system. We never ask users to install anything to do their best work.' },
              { icon: Shield, title: 'Privacy by default', desc: 'Your designs are yours. We never sell data, never train models on private projects, and never lock you in.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border p-5" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FAF8F4' }}>
                    <Icon className="w-4 h-4" style={{ color: '#7A6E62' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: '#2D2D2D' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#5A4E42' }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0E8D8' }}>
              <Users className="w-5 h-5" style={{ color: '#7A6E62' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>The Team</h2>
          </div>

          {/* Founder Card */}
          <div className="rounded-2xl border p-8 mb-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #F0E8D8, #E8DFD4)' }}>
                <span className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#7A6E62' }}>MS</span>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Muhammad Saadi</h3>
                <p className="text-sm font-semibold mb-3" style={{ color: '#7A6E62' }}>Founder &amp; Lead Developer</p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#5A4E42' }}>
                  Instod started as a personal frustration: why is visualizing a room redesign so expensive and complicated?
                  After years of working with 3D web technologies, I set out to build a tool that makes professional-quality
                  room visualization accessible to everyone — no downloads, no design degree required. What began as a side
                  project has grown into a platform used by thousands of early adopters, and I am incredibly grateful for
                  every piece of feedback that shapes its future.
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:shadow-sm"
                    style={{ borderColor: '#E2DDD4', color: '#5A4E42' }}
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all hover:shadow-sm"
                    style={{ borderColor: '#E2DDD4', color: '#5A4E42' }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* We're Hiring Banner */}
          <div
            className="rounded-2xl border-2 p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)', borderColor: '#E8DFD4' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: '#C17F4E15' }}>
              <Rocket className="w-3.5 h-3.5" style={{ color: '#C17F4E' }} />
              <span className="text-xs font-bold" style={{ color: '#C17F4E' }}>WE&apos;RE HIRING</span>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Help us build the future of interior design
            </h3>
            <p className="text-sm leading-relaxed max-w-md mx-auto mb-4" style={{ color: '#5A4E42' }}>
              We&apos;re looking for a Senior Three.js Engineer and a Product Designer to join the founding team.
              Equity-heavy compensation, remote-friendly.
            </p>
            <Link
              href="/contact?subject=Careers"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Built With */}
        <div className="rounded-2xl border p-8 mb-16" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Built With Modern Technology</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#5A4E42' }}>
            Instod leverages the latest web technologies to deliver a desktop-class 3D design experience directly in your browser. Our real-time rendering engine uses PBR (Physically Based Rendering) materials and dynamic lighting to create stunningly realistic room previews.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Three.js & WebGL', desc: 'Real-time 3D rendering' },
              { label: 'Next.js & React', desc: 'Fast, modern web framework' },
              { label: 'PBR Materials', desc: 'Physically realistic surfaces' },
              { label: 'Dynamic Lighting', desc: '4 mood presets + custom' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAF8F4' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#7A6E62' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#2D2D2D' }}>{label}</p>
                  <p className="text-xs" style={{ color: '#5A4E42' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beta Notice */}
        <div className="text-center rounded-2xl border-2 p-8" style={{ background: '#FAF8F4', borderColor: '#E8DFD4' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#F0E8D8' }}>
            <Shield className="w-6 h-6" style={{ color: '#7A6E62' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>We&apos;re in Early Access Beta</h2>
          <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: '#5A4E42' }}>
            Instod is actively being developed and improved. During this beta phase, all premium features are completely free. We&apos;re building this with our community — your feedback shapes the product.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/editor"
              prefetch={false}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
            >
              Try the Editor
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:shadow-sm"
              style={{ borderColor: '#E2DDD4', color: '#2D2D2D' }}
            >
              Send Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t" style={{ borderColor: '#E2DDD4' }}>
        <p className="text-sm" style={{ color: '#5A4E42' }}>
          &copy; {new Date().getFullYear()} Instod. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
