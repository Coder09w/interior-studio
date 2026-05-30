import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BetaBanner } from "@/components/beta-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://instod.vercel.app"
  ),
  title: {
    default: "Interior Studio — 3D Design Previewer",
    template: "%s | Interior Studio",
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
    "interior studio",
  ],
  authors: [{ name: "Interior Studio" }],
  creator: "Interior Studio",
  publisher: "Interior Studio",
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
    siteName: "Interior Studio",
    title: "Interior Studio — 3D Design Previewer",
    description:
      "Design your dream space in 3D. Drag furniture, swap materials, and see your vision come to life.",
    images: [
      {
        url: "/images/hero-living-room.png",
        width: 1200,
        height: 630,
        alt: "Interior Studio — 3D Interior Design Previewer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Studio — 3D Design Previewer",
    description:
      "Design your dream space in 3D. Drag furniture, swap materials, and see your vision come to life.",
    images: ["/images/hero-living-room.png"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${dmSans.variable} antialiased bg-background text-foreground`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <AuthProvider>
          <BetaBanner />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
