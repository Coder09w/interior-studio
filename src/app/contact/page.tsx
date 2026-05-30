'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sofa, ArrowLeft, Mail, MessageSquare, HelpCircle, Send, Phone, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  {
    question: 'How do I get started with the 3D room editor?',
    answer:
      'Getting started is easy! Simply visit our editor page and you can begin designing immediately — no sign-up required. You can choose from 5 different room types, drag and drop furniture items, adjust materials and colors, and experiment with 4 lighting moods. When you are ready to save your design, create a free account to store up to 3 designs. For unlimited designs and additional features, consider upgrading to our Pro plan.',
  },
  {
    question: 'What file formats can I export my designs in?',
    answer:
      'Free users can export their designs as screenshots (PNG format) directly from the 3D editor. Pro and Studio subscribers gain access to additional export options including high-resolution images (PNG and JPEG) and PDF documents with room specifications and material lists. The Studio plan also supports exporting design packages that can be shared with clients for review and feedback through our collaboration tools.',
  },
  {
    question: 'Can I share my designs with others?',
    answer:
      'Yes! Pro and Studio plan subscribers can generate shareable viewing links that allow others to explore your 3D designs in a web browser without needing an account. Recipients can rotate, zoom, and pan around the room to see your design from every angle. Studio plan users also have access to client sharing and feedback features, where clients can leave comments and annotations directly on specific elements of the design.',
  },
  {
    question: 'How do I cancel or change my subscription?',
    answer:
      'You can manage your subscription directly from your account settings page. Navigate to your profile, select the billing tab, and you will find options to upgrade, downgrade, or cancel your plan. When you cancel, you will retain access to your current plan features until the end of your billing period. We do not offer partial refunds for unused billing cycles, but you will never be charged again after cancellation. Your designs remain accessible even after downgrading to the free tier, though you may need to reduce your saved designs to fit the free plan limit.',
  },
  {
    question: 'Is my design data secure and private?',
    answer:
      'Absolutely. We take the security and privacy of your design data very seriously. All data is encrypted both in transit and at rest using industry-standard protocols. Your designs are stored securely and are never shared with third parties for marketing or advertising purposes. Free plan designs may be featured in anonymized promotional materials, but Pro and Studio users maintain full control over the visibility of their work. You can delete any design or your entire account at any time, and we will remove your data from our systems within 30 days. For full details, please review our Privacy Policy.',
  },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate a brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast({
      title: 'Message sent successfully!',
      description: 'Thank you for reaching out. Our team will get back to you within 24-48 hours.',
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      {/* Navbar */}
      <nav className="border-b" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#C17F4E' }}>
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Interior Studio
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#8A8478' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm" style={{ color: '#8A8478' }}>
          <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
          <span>/</span>
          <span style={{ color: '#2D2D2D' }} className="font-medium">Contact Us</span>
        </nav>
      </div>

      {/* Header */}
      <div className="text-center pt-10 pb-12 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: '#FAF8F4', border: '1px solid #E2DDD4' }}>
          <MessageSquare className="w-7 h-7" style={{ color: '#C17F4E' }} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
          Get in Touch
        </h1>
        <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: '#8A8478' }}>
          Have a question, suggestion, or need help? We are here for you. Reach out and our team will respond promptly.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Support Email Card */}
            <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FAF8F4' }}>
                  <Mail className="w-5 h-5" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Email Support</h3>
                  <p className="text-xs" style={{ color: '#8A8478' }}>We respond within 24-48 hours</p>
                </div>
              </div>
              <a
                href="mailto:support@instod.vercel.app"
                className="text-sm font-medium hover:underline"
                style={{ color: '#C17F4E' }}
              >
                support@instod.vercel.app
              </a>
            </div>

            {/* Response Time Card */}
            <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FAF8F4' }}>
                  <Clock className="w-5 h-5" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Business Hours</h3>
                  <p className="text-xs" style={{ color: '#8A8478' }}>Monday — Friday</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#555' }}>
                9:00 AM — 6:00 PM EST
              </p>
              <p className="text-xs mt-1" style={{ color: '#8A8478' }}>
                Weekend inquiries answered by Monday
              </p>
            </div>

            {/* Other Contact Info */}
            <div className="rounded-2xl border p-6" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FAF8F4' }}>
                  <MapPin className="w-5 h-5" style={{ color: '#C17F4E' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Office</h3>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#555' }}>
                Interior Studio Inc.<br />
                123 Design Avenue, Suite 400<br />
                San Francisco, CA 94105
              </p>
            </div>

            {/* Priority Support Note */}
            <div className="rounded-2xl border p-5" style={{ background: 'linear-gradient(135deg, #FAF8F4, #F5F0E8)', borderColor: '#E2DDD4' }}>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C17F4E' }} />
                <div>
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>Priority Support</h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8A8478' }}>
                    Pro and Studio subscribers receive priority support with guaranteed response times. Upgrade your plan for faster assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
                  Send Us a Message
                </CardTitle>
                <CardDescription style={{ color: '#8A8478' }}>
                  Fill out the form below and we will get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" style={{ color: '#2D2D2D' }}>Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border bg-white"
                        style={{ borderColor: '#E2DDD4' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" style={{ color: '#2D2D2D' }}>Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl border bg-white"
                        style={{ borderColor: '#E2DDD4' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" style={{ color: '#2D2D2D' }}>Subject</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger
                        id="subject"
                        className="w-full rounded-xl border bg-white"
                        style={{ borderColor: '#E2DDD4', color: formData.subject ? '#2D2D2D' : '#8A8478' }}
                      >
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl" style={{ borderColor: '#E2DDD4' }}>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" style={{ color: '#2D2D2D' }}>Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="rounded-xl border bg-white resize-none"
                      style={{ borderColor: '#E2DDD4' }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto rounded-xl px-8 py-3 font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#FAF8F4', border: '1px solid #E2DDD4' }}>
              <HelpCircle className="w-6 h-6" style={{ color: '#C17F4E' }} />
            </div>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: '#2D2D2D' }}>
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: '#8A8478' }}>
              Find quick answers to common questions about Interior Studio.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#FFFFFF', borderColor: '#E2DDD4' }}>
              <Accordion type="single" collapsible className="px-6">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border-b last:border-b-0"
                    style={{ borderColor: '#E2DDD4' }}
                  >
                    <AccordionTrigger
                      className="text-left text-sm font-semibold py-5 hover:no-underline"
                      style={{ color: '#2D2D2D', fontFamily: "'Outfit', sans-serif" }}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent
                      className="text-sm leading-relaxed pb-5"
                      style={{ color: '#555' }}
                    >
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
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
            <div className="flex items-center gap-6 text-sm" style={{ color: '#8A8478' }}>
              <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link>
              <Link href="/contact" className="font-medium" style={{ color: '#C17F4E' }}>Contact Us</Link>
            </div>
            <p className="text-xs" style={{ color: '#8A8478' }}>
              &copy; 2026 Interior Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
