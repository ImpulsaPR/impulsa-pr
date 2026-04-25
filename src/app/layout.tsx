import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = Fraunces({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cliente.impulsapr.com"),
  title: {
    default: "Impulsa PR — Dashboard",
    template: "%s · Impulsa PR",
  },
  description:
    "Panel de automatización para WhatsApp — gestiona leads, pipeline y conversaciones con IA. Impulsa PR.",
  applicationName: "Impulsa PR",
  alternates: { canonical: "https://cliente.impulsapr.com" },
  openGraph: {
    type: "website",
    locale: "es_PR",
    url: "https://cliente.impulsapr.com",
    siteName: "Impulsa PR",
    title: "Impulsa PR — Dashboard",
    description: "Panel de automatización para WhatsApp — gestiona leads, pipeline y conversaciones con IA.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Impulsa PR Dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impulsa PR — Dashboard",
    description: "Panel de automatización para WhatsApp — gestiona leads, pipeline y conversaciones con IA.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf5" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-background focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Saltar al contenido principal
        </a>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
