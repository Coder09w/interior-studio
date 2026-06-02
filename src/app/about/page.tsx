'use client';

import Link from 'next/link';
import SiteNav from '@/components/site-nav';
import { Sofa, Heart, Rocket, Users, ArrowLeft, Sparkles, Globe, Shield } from 'lucide-react';

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: '#C17F4E15' }}>
            <Sofa className="w-4 h-4" style={{ color: '#C17F4E' }} />
            <span className="text-sm font-semibold" style={{ color: '#C17F4E' }}>Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
            Making Interior Design <span style={{ color: '#C17F4E' }}>Accessible to Everyone</span>
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#5A4E42' }}>
            Interior Studio was born from a simple idea: everyone deserves to visualize their dream space before committing to it. We believe great design shouldn't require expensive software or a professional degree.
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
              description: 'No downloads, no plugins, no compatibility issues. Interior Studio runs entirely in your web browser using cutting-edge WebGL technology. Design from any device.',
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

        {/* Built With */}
        <div className="rounded-2xl border p-8 mb-16" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Built With Modern Technology</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#5A4E42' }}>
            Interior Studio leverages the latest web technologies to deliver a desktop-class 3D design experience directly in your browser. Our real-time rendering engine uses PBR (Physically Based Rendering) materials and dynamic lighting to create stunningly realistic room previews.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Three.js & WebGL', desc: 'Real-time 3D rendering' },
              { label: 'Next.js & React', desc: 'Fast, modern web framework' },
              { label: 'PBR Materials', desc: 'Physically realistic surfaces' },
              { label: 'Dynamic Lighting', desc: '4 mood presets + custom' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAF8F4' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(193,127,78,0.1)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#C17F4E' }} />
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
        <div className="text-center rounded-2xl border-2 p-8" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)', borderColor: '#C17F4E40' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#C17F4E' }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>We're in Early Access Beta</h2>
          <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: '#5A4E42' }}>
            Interior Studio is actively being developed and improved. During this beta phase, all premium features are completely free. We're building this with our community — your feedback shapes the product.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/editor"
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
          &copy; {new Date().getFullYear()} Interior Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
