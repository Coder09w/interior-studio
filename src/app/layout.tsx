import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit, DM_Sans, Inter } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";
// import { PostHogProvider } from "@/components/providers/posthog-provider";
import { BetaBanner } from "@/components/beta-banner";
import { FeedbackButton } from "@/components/feedback-button";
import { AnalyticsRouteTracker } from "@/components/analytics/analytics-route-tracker";
// import { CookieConsent } from "@/components/cookie-consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://instod.vercel.app"
  ),
  title: {
    default: "Instod — 3D Design Previewer",
    template: "%s | Instod",
  },
  description:
    "Interactive 3D interior design previewer with furniture library, material system, and real-time controls. Design your dream space in minutes.",
  keywords: [
    "interior design",
    "3D room designer",
    "Three.js",
    "room planner",
    "furniture",
    "home design",
    "3D preview",
    "instod",
  ],
  authors: [{ name: "Muhammad Saadi" }],
  creator: "Muhammad Saadi",
  publisher: "Instod",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://instod.vercel.app",
    siteName: "Instod",
    title: "Instod — 3D Design Previewer",
    description:
      "Design your dream space in 3D. Drag furniture, swap materials, and see your vision come to life.",
    images: [
      {
        url: "/images/hero-living-room.png",
        width: 1200,
        height: 630,
        alt: "Instod — 3D Interior Design Previewer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instod — 3D Design Previewer",
    description:
      "Design your dream space in 3D. Drag furniture, swap materials, and see your vision come to life.",
    images: ["/images/hero-living-room.png"],
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "150x185" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://instod.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${dmSans.variable} antialiased bg-background text-foreground`}
      >
        {/* Google Analytics 4 — only loads when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <AuthProvider>
          {/* <PostHogProvider> */}
            <BetaBanner />
            <AnalyticsRouteTracker />
            <div id="main-content">
              {children}
            </div>
            <FeedbackButton />
            {/* <CookieConsent /> */}
          {/* </PostHogProvider> */}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
