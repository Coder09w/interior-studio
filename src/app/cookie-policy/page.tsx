import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sofa, Cookie, Settings, Shield, BarChart3, Mail } from 'lucide-react';
import SiteNav from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Learn how Instod uses cookies and similar technologies to improve your experience on our 3D room design platform.',
};

const sections = [
  {
    id: 'what-are-cookies',
    icon: Cookie,
    title: '1. What Are Cookies',
    content: `Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and supply information to the site owners. In addition to cookies, we may also use similar technologies such as local storage, session storage, and pixel tags, which function in similar ways to cookies.

When you use Instod, we use these technologies to remember your preferences, keep you signed in, understand how you interact with our platform, and improve our services over time. This policy explains what types of cookies and similar technologies we use, why we use them, and how you can manage your preferences.`,
  },
  {
    id: 'essential-cookies',
    icon: Settings,
    title: '2. Essential Cookies',
    content: `Essential cookies are strictly necessary for the operation of our platform. These cookies enable core functionality such as page navigation, secure access to authenticated areas, and session management for the 3D editor. Without these cookies, the platform cannot function properly — you would not be able to stay logged in, save your room designs, or use the editor interface.

Specifically, we use essential cookies for: maintaining your login session so you do not need to re-authenticate on each page, storing your design preferences and editor state while you work on a room, ensuring secure communication between your browser and our servers, and remembering your consent preferences for non-essential cookies. These cookies cannot be disabled as they are fundamental to the service.`,
  },
  {
    id: 'analytics-cookies',
    icon: BarChart3,
    title: '3. Analytics and Performance Cookies',
    content: `We use analytics cookies through PostHog, a privacy-first product analytics platform, to collect information about how users interact with our platform. This helps us understand which features are most popular, identify areas where users may encounter difficulties, and measure the overall performance and reliability of our service. The data collected through analytics cookies is aggregated and anonymized — it does not identify you personally.

PostHog analytics cookies help us track metrics such as: the number of visitors to our platform, which pages and features are used most frequently, how long users spend in the 3D editor, the types of rooms and furniture most commonly created, error rates and performance bottlenecks, and the general geographic distribution of our user base. We have configured PostHog to disable session recording — no video or screen recordings of your sessions are made. You may choose to opt out of analytics cookies through the cookie consent banner on our platform or through your browser settings. If you opt out, PostHog will switch to memory-only persistence and will not store any cookies on your device. Disabling analytics cookies will not affect the core functionality of the 3D editor or your ability to save and manage your designs.`,
  },
  {
    id: 'managing-cookies',
    icon: Shield,
    title: '4. Managing Your Cookie Preferences',
    content: `You have the right to decide whether to accept or reject cookies. Most web browsers are set to accept cookies by default, but you can modify your browser settings to decline cookies or alert you when a cookie is being placed on your device. You can find instructions for managing cookies in popular browsers through their respective help pages.

Please note that if you choose to block or delete essential cookies, some features of Instod may not function properly. For example, you may not be able to stay logged in, your design preferences may not be saved between sessions, and the 3D editor may not load correctly. Non-essential cookies such as analytics cookies can be safely disabled without impacting core functionality. You can also periodically clear your cookies through your browser settings, though this will log you out and reset any saved preferences.`,
  },
  {
    id: 'third-party-cookies',
    icon: Settings,
    title: '5. Third-Party Cookies',
    content: `We use a limited number of third-party services that may place their own cookies on your device. These include authentication providers that help us securely manage your login, and PostHog (posthog.com), our analytics provider that helps us understand platform usage. PostHog is a privacy-first analytics platform that processes data on our behalf and does not use your data for its own purposes. We carefully vet all third-party services to ensure they meet our privacy and security standards.

We do not allow advertising cookies or tracking pixels from ad networks, data brokers, or social media platforms. We do not participate in cross-site tracking or retargeting. Any third-party cookies present on our platform are solely for operational and analytical purposes directly related to providing and improving the Instod service.`,
  },
  {
    id: 'changes-and-contact',
    icon: Mail,
    title: '6. Changes and Contact',
    content: `We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about how we use cookies.

If you have any questions about our use of cookies or this Cookie Policy, please contact us at privacy@instod.com. For general support, email support@instod.com. For legal inquiries, contact legal@instod.com. You can also reach us through our contact page at https://instod.vercel.app/contact.`,
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      {/* Navbar */}
      <SiteNav
        variant="solid"
        showBeta={false}
        rightContent={
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#5A4E42' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        }
      />

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm" style={{ color: '#5A4E42' }}>
          <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
          <span>/</span>
          <span style={{ color: '#2D2D2D' }} className="font-medium">Cookie Policy</span>
        </nav>
      </div>

      {/* Header */}
      <div className="text-center pt-10 pb-12 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: '#FAF8F4', border: '1px solid #E2DDD4' }}>
          <Cookie className="w-7 h-7" style={{ color: '#7A6E62' }} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Cookie Policy
        </h1>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#5A4E42' }}>
          Learn how Instod uses cookies and similar technologies to enhance your experience.
        </p>
        <p className="mt-3 text-sm" style={{ color: '#5A4E42' }}>
          Last updated: June 10, 2026
        </p>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl border p-6" style={{ background: '#FAF8F4', borderColor: '#E2DDD4' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#5A4E42' }}>
            Table of Contents
          </h2>
          <nav className="grid sm:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2.5 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors hover:bg-white/60"
                style={{ color: '#2D2D2D' }}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" style={{ color: '#7A6E62' }} />
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="rounded-2xl border p-6 sm:p-8 scroll-mt-24"
              style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FAF8F4' }}>
                  <section.icon className="w-5 h-5" style={{ color: '#7A6E62' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                  {section.title}
                </h2>
              </div>
              <div className="text-sm leading-relaxed space-y-4" style={{ color: '#555' }}>
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph.trim()}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0E8D8' }}>
                <Sofa className="w-4 h-4" style={{ color: '#7A6E62' }} />
              </div>
              <span className="text-sm font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                Instod
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#5A4E42' }}>
              <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link>
              <Link href="/cookie-policy" className="font-medium" style={{ color: '#C17F4E' }}>Cookie Policy</Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity">Contact Us</Link>
            </div>
            <p className="text-xs" style={{ color: '#5A4E42' }}>
              &copy; 2026 Instod. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
