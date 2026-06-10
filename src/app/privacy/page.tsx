import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sofa, Shield, Cookie, Database, Users, Mail, Lock } from 'lucide-react';
import SiteNav from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Instod collects, uses, and protects your personal data. Our privacy policy outlines your rights and our commitments to data security.',
};

const sections = [
  {
    id: 'information-we-collect',
    icon: Database,
    title: '1. Information We Collect',
    content: `When you use Instod, we collect certain information to provide and improve our services. This includes personal information you provide directly, such as your name, email address, and account credentials when you register for an account. We also collect information about the room designs you create, including layout configurations, furniture placements, material selections, and color choices — this data is essential for saving and rendering your design projects across sessions.

In addition to the information you provide, we automatically collect certain technical data when you interact with our platform. This includes your IP address, browser type, operating system, device identifiers, and pages visited within the application. We also record usage patterns such as the features you use most frequently, the time spent in the 3D editor, and the actions you perform within a design session. This information helps us understand how our users engage with the platform and enables us to prioritize feature development and bug fixes effectively.`,
  },
  {
    id: 'cookies-and-analytics',
    icon: Cookie,
    title: '2. Cookies and Analytics',
    content: `Instod uses cookies and similar tracking technologies to enhance your browsing experience and collect analytical data. Essential cookies are used to maintain your session state, remember your login credentials, and preserve your design preferences between visits. These cookies are necessary for the core functionality of the platform and cannot be disabled without affecting your ability to use certain features.

We also utilize analytics cookies to gather aggregated, non-personally identifiable information about how users interact with our website. This includes data on page views, session duration, navigation paths, and feature adoption rates. The insights derived from analytics help us optimize the user interface, improve performance, and identify areas where users may encounter difficulties. You may choose to opt out of analytics cookies through your browser settings or through cookie preference tools provided on our platform. However, disabling analytics cookies will not affect the core functionality of the 3D editor or your ability to save and manage designs.`,
  },
  {
    id: 'third-party-services',
    icon: Users,
    title: '3. Third-Party Services',
    content: `Instod integrates with trusted third-party services to deliver core functionality. We use NextAuth.js for authentication, which handles your login credentials securely. Your authentication data is processed according to our strict data protection standards, and we only collect the minimum information necessary to identify your account — typically your name and email address.

Our application data is stored in a secure, encrypted database with robust access controls. This ensures that your design projects, account information, and preferences are stored safely on our infrastructure. We do not share your personal data or design content with advertising networks, data brokers, or any third parties for marketing purposes. When we engage subprocessors to assist with operations such as hosting, email delivery, or customer support, we ensure they adhere to data protection standards equivalent to our own and process data only under our instructions.`,
  },
  {
    id: 'data-storage-and-security',
    icon: Lock,
    title: '4. Data Storage and Security',
    content: `Your data is stored on secure servers with industry-standard encryption both in transit and at rest. All communications between your browser and our servers are protected using TLS 1.3 encryption, ensuring that your design data, personal information, and authentication credentials cannot be intercepted by unauthorized parties. Database backups are encrypted and stored in geographically separate locations to protect against data loss.

We implement a comprehensive set of security measures including firewalls, intrusion detection systems, regular security audits, and access controls that limit data access to authorized personnel on a need-to-know basis. Our development team follows secure coding practices and conducts regular vulnerability assessments to identify and remediate potential threats. Despite our best efforts, no system can guarantee absolute security. In the event of a data breach, we will notify affected users within 72 hours as required by applicable data protection regulations and take immediate steps to contain and remediate the incident.`,
  },
  {
    id: 'your-rights',
    icon: Shield,
    title: '5. Your Rights and Choices',
    content: `You have the right to access, correct, update, or delete your personal information at any time through your account settings. You may export all of your design data, including room configurations and saved projects, in a structured format that can be used with compatible applications. If you wish to delete your account entirely, we will remove all associated personal data and design content from our systems within 30 days, with the exception of data that we are legally required to retain.

Depending on your jurisdiction, you may have additional rights under data protection laws such as the General Data Protection Regulation (GDPR) for European users, or the California Consumer Privacy Act (CCPA) for California residents. These rights may include the right to restrict processing, the right to data portability, the right to object to certain types of processing, and the right not to be subject to automated decision-making. To exercise any of these rights, please contact our privacy team using the contact information provided below. We will respond to all legitimate requests within 30 days.`,
  },
  {
    id: 'international-use',
    icon: Users,
    title: '6. International Use',
    content: `Instod is a Pakistan-based product serving users internationally. If you access Instod from outside Pakistan, your data may be processed in countries where our service providers operate. By using our platform, you acknowledge that your information may be transferred to and processed in jurisdictions that may have different data protection standards than your country of residence.

We take appropriate measures to ensure your data receives an adequate level of protection regardless of where it is processed. For users in the European Economic Area, we maintain compliance with the General Data Protection Regulation (GDPR) to the extent applicable to our services. For users in California, we respect the rights outlined in the California Consumer Privacy Act (CCPA). Regardless of your location, we apply the same robust security standards and privacy practices described in this policy.`,
  },
  {
    id: 'childrens-privacy',
    icon: Shield,
    title: '7. Children\'s Privacy',
    content: `Instod is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If we become aware that we have collected personal data from a child under 13 without such consent, we will take steps to delete that information as quickly as possible.

For users between the ages of 13 and 18, we recommend that a parent or guardian review this Privacy Policy and supervise their use of the platform. Parents who believe their child has provided us with personal information without their consent may contact us at privacy@instod.com to request the deletion of that data.`,
  },
  {
    id: 'changes-to-policy',
    icon: Mail,
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes, we will notify you by posting the updated policy on our website with a revised "Last updated" date and, for significant changes, by sending a notification to the email address associated with your account.

We encourage you to review this policy periodically to stay informed about how we protect your information. Your continued use of Instod after any changes to this policy constitutes your acceptance of the updated terms.`,
  },
  {
    id: 'contact-information',
    icon: Mail,
    title: '9. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices, we encourage you to reach out to us. We are committed to addressing your inquiries promptly and transparently.

For privacy-related matters, including data access requests and deletion requests, please contact us at privacy@instod.com. For general support inquiries, account-related issues, or technical assistance, please use our contact form at https://instod.vercel.app/contact or email support@instod.com. For legal inquiries, contact legal@instod.com. Our team typically responds within 1 to 3 business days. Instod is a Pakistan-based product serving international users.`,
  },
];

export default function PrivacyPolicyPage() {
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
          <span style={{ color: '#2D2D2D' }} className="font-medium">Privacy Policy</span>
        </nav>
      </div>

      {/* Header */}
      <div className="text-center pt-10 pb-12 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: '#FAF8F4', border: '1px solid #E2DDD4' }}>
          <Shield className="w-7 h-7" style={{ color: '#7A6E62' }} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#5A4E42' }}>
          Your privacy matters to us. This policy explains how Instod collects, uses, and protects your personal information.
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
              <Link href="/privacy" className="font-medium" style={{ color: '#C17F4E' }}>Privacy Policy</Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link>
              <Link href="/cookie-policy" className="hover:opacity-80 transition-opacity">Cookie Policy</Link>
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
