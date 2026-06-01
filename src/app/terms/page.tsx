import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sofa, FileText, UserCheck, AlertTriangle, Palette, CreditCard, Scale, XCircle, RefreshCw, Gavel } from 'lucide-react';
import SiteNav from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the Terms of Service for Interior Studio. Understand your rights and responsibilities when using our 3D interior design platform.',
};

const sections = [
  {
    id: 'acceptance-of-terms',
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Interior Studio platform, including our website, 3D design editor, and all associated services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of the platform immediately. These terms constitute a legally binding agreement between you and Interior Studio.

These Terms of Service apply to all users of the platform, including free users, Pro subscribers, Studio subscribers, and visitors who access the platform without creating an account. We reserve the right to update these terms at any time, and your continued use of the platform following any changes constitutes your acceptance of the revised terms. We will make reasonable efforts to notify you of material changes via email or an in-app notification at least 30 days before they take effect.`,
  },
  {
    id: 'account-responsibilities',
    icon: UserCheck,
    title: '2. Account Responsibilities',
    content: `When you create an account with Interior Studio, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during the registration process and keep your account details updated at all times. If you suspect that your account has been compromised or accessed without your authorization, you must notify us immediately at security@instod.vercel.app.

You agree not to share your account credentials with any third party, not to create multiple accounts for the purpose of exploiting free tier limitations, and not to use another person's account without their explicit permission. Each account is intended for individual use, and any shared access must be facilitated through the team collaboration features available on the Studio plan. We reserve the right to suspend or terminate accounts that violate these responsibilities, particularly in cases involving fraudulent activity, unauthorized access, or abuse of the platform's resources.`,
  },
  {
    id: 'acceptable-use',
    icon: AlertTriangle,
    title: '3. Acceptable Use Policy',
    content: `You agree to use Interior Studio in a manner that is lawful, respectful, and consistent with the intended purpose of the platform — creating and sharing interior design concepts. You must not use the platform to create, store, or distribute content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. This includes content that infringes on the intellectual property rights of others, promotes discrimination, or violates any applicable local, state, national, or international law.

Prohibited activities include, but are not limited to: attempting to gain unauthorized access to our systems or other users' accounts, using automated scripts or bots to interact with the platform, introducing malicious code or exploiting vulnerabilities, reverse engineering or decompiling any part of the platform, and using the service to send spam or unsolicited communications. We reserve the right to investigate and take appropriate action against anyone who, in our sole discretion, violates this Acceptable Use Policy, including removing content, suspending accounts, and reporting illegal activities to law enforcement authorities.`,
  },
  {
    id: 'intellectual-property',
    icon: Palette,
    title: '4. Intellectual Property',
    content: `All content, features, and functionality of the Interior Studio platform — including but not limited to the user interface, 3D rendering engine, furniture models, material textures, design algorithms, graphics, logos, and text — are owned by Interior Studio and are protected by international copyright, trademark, patent, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our services without prior written consent.

You retain full ownership of the room designs and creative content you produce using Interior Studio. By creating and saving a design, you grant Interior Studio a limited, non-exclusive, worldwide license to store, render, and display your designs as necessary to provide the service. For users on the Free plan, this includes the right to feature anonymized or aggregated designs in promotional materials. Pro and Studio users maintain full control over the visibility and sharing of their designs. If you delete a design or your account, we will remove your content from our active systems within 30 days, though residual copies may persist in encrypted backups for up to 90 days.`,
  },
  {
    id: 'subscription-plans',
    icon: CreditCard,
    title: '5. Subscription Plans and Billing',
    content: `Interior Studio offers three subscription tiers designed to meet the needs of different users. The Free plan provides full access to the 3D room editor, over 30 furniture items, 5 room types, 4 lighting moods, the material and color system, screenshot export, and up to 3 saved designs. This plan is available at no cost and requires no payment information.

The Pro plan, priced at $12 per month, includes everything in the Free plan plus unlimited saved designs, multiple rooms per project, shareable viewing links, priority rendering, custom room dimensions, image and PDF export, and email support. The Studio plan, priced at $29 per month, is designed for professional interior designers and includes everything in the Pro plan plus unlimited projects, client sharing and feedback tools, brand customization, API access, team collaboration, priority support, and custom furniture uploads.

All paid subscriptions are billed on a recurring monthly basis. Payments are processed securely at the time of subscription and on each renewal date. You may cancel your subscription at any time through your account settings, and you will retain access to your plan features until the end of the current billing period. No partial refunds are provided for unused portions of a billing cycle. We reserve the right to modify pricing with 30 days' advance notice, and your continued use after a price change constitutes acceptance of the new rate.`,
  },
  {
    id: 'limitation-of-liability',
    icon: Scale,
    title: '6. Limitation of Liability',
    content: `Interior Studio provides the platform on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components, or that the results obtained from using the service will be accurate or reliable.

To the maximum extent permitted by applicable law, Interior Studio and its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, or goodwill, arising out of or in connection with your use of the platform. In no event shall our total liability to you exceed the amount you have paid to Interior Studio in the twelve months preceding the claim, or one hundred dollars ($100), whichever is greater. This limitation applies regardless of the legal theory on which the claim is based, whether in contract, tort, strict liability, or otherwise.`,
  },
  {
    id: 'termination',
    icon: XCircle,
    title: '7. Termination',
    content: `Either you or Interior Studio may terminate this agreement at any time. You may deactivate your account and stop using the platform at any time by contacting us or through your account settings. Upon account deletion, we will remove your personal information and design content from our active systems in accordance with our data retention policies, typically within 30 days.

We reserve the right to suspend or terminate your account without prior notice if we reasonably believe you have violated these Terms of Service, our Acceptable Use Policy, or any applicable law. In the case of a paid subscription, termination for cause will not entitle you to a refund for any remaining portion of your billing period. Upon termination, all licenses and rights granted to you under these terms will immediately cease, and you must discontinue all use of the platform and its content. Provisions that by their nature should survive termination — including intellectual property, limitation of liability, and governing law — shall remain in effect.`,
  },
  {
    id: 'changes-to-terms',
    icon: RefreshCw,
    title: '8. Changes to Terms',
    content: `Interior Studio reserves the right to modify or replace these Terms of Service at any time at our sole discretion. When we make material changes, we will provide at least 30 days' notice before the new terms take effect by posting the updated terms on our website and sending a notification to the email address associated with your account. We encourage you to review these terms periodically to stay informed of any changes.

Your continued use of the platform after the revised terms become effective constitutes your acceptance of the updated agreement. If you do not agree with the revised terms, you may choose to discontinue use of the platform before the changes take effect, and you will not be bound by the new terms. For paid subscribers, if a material change adversely affects your subscription, you may cancel within the 30-day notice period and receive a prorated refund for the unused portion of your current billing cycle.`,
  },
  {
    id: 'governing-law',
    icon: Gavel,
    title: '9. Governing Law',
    content: `These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising out of or relating to these terms or your use of the platform shall be resolved exclusively in the state or federal courts located in Delaware, and you consent to the personal jurisdiction of such courts.

If any provision of these Terms of Service is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining terms remain in full force and effect. The failure of Interior Studio to enforce any right or provision of these terms shall not constitute a waiver of such right or provision. These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Interior Studio regarding the use of the platform.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      {/* Navbar */}
      <SiteNav
        variant="solid"
        showBeta={false}
        rightContent={
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#6B6358' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        }
      />

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm" style={{ color: '#6B6358' }}>
          <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
          <span>/</span>
          <span style={{ color: '#2D2D2D' }} className="font-medium">Terms of Service</span>
        </nav>
      </div>

      {/* Header */}
      <div className="text-center pt-10 pb-12 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: '#FAF8F4', border: '1px solid #E2DDD4' }}>
          <FileText className="w-7 h-7" style={{ color: '#C17F4E' }} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Terms of Service
        </h1>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#6B6358' }}>
          Please read these terms carefully before using Interior Studio. By using our platform, you agree to these terms.
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-sm" style={{ color: '#6B6358' }}>
          <span>Effective date: January 1, 2026</span>
          <span className="w-1 h-1 rounded-full" style={{ background: '#E2DDD4' }}></span>
          <span>Last updated: March 4, 2026</span>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
        <div className="rounded-2xl border p-6" style={{ background: '#FAF8F4', borderColor: '#E2DDD4' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#6B6358' }}>
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
                <section.icon className="w-4 h-4 flex-shrink-0" style={{ color: '#C17F4E' }} />
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
                  <section.icon className="w-5 h-5" style={{ color: '#C17F4E' }} />
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C17F4E' }}>
                <Sofa className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                Interior Studio
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#6B6358' }}>
              <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
              <Link href="/terms" className="font-medium" style={{ color: '#C17F4E' }}>Terms of Service</Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity">Contact Us</Link>
            </div>
            <p className="text-xs" style={{ color: '#6B6358' }}>
              &copy; 2026 Interior Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
