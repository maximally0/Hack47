import type { Metadata, Viewport } from "next";
import { Archivo, DM_Mono } from "next/font/google";
import { ApplyProvider } from "@/components/ApplyProvider";
import { SmoothAnchors } from "@/components/SmoothAnchors";
import { SITE } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "hack47 is a thirty-day builder residency in a Delhi villa. Sixteen places, one cohort, no distractions — just shipping. Applications open for batch 01, Sept 15 – Oct 15. Expanding across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "hack47 — Delhi's first hacker house",
    template: "%s | hack47",
  },
  description: DESCRIPTION,
  keywords: [
    "hacker house",
    "Delhi",
    "residency",
    "builders",
    "startup",
    "coliving",
    "hackathon",
    "hack47",
    "India",
    "founder residency",
  ],
  authors: [{ name: "hack47" }],
  creator: "hack47",
  publisher: "hack47",
  applicationName: "hack47",
  alternates: { canonical: "/" },
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
    locale: "en_IN",
    url: SITE.url,
    siteName: "hack47",
    title: "hack47 — Delhi's first hacker house",
    description:
      "Thirty days. Sixteen builders. One Delhi villa. No distractions, just shipping. Applications open for batch 01.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "hack47 — Delhi's first hacker house",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "hack47 — Delhi's first hacker house",
    description:
      "Thirty days. Sixteen builders. One Delhi villa. Applications open for batch 01.",
    images: ["/og-image.png"],
    creator: "@hack47org",
    site: "@hack47org",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#080807",
  colorScheme: "dark",
  viewportFit: "cover",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}#organization`,
      name: "hack47",
      url: SITE.url,
      email: SITE.email,
      description: DESCRIPTION,
      logo: `${SITE.url}/logo.png`,
      sameAs: [
        "https://x.com/hack47org",
        "https://www.instagram.com/hack47.0rg/",
        "https://www.linkedin.com/company/hack47",
      ],
    },
    {
      "@type": "Event",
      name: "hack47 — batch 01",
      description:
        "A thirty-day builder residency in a Delhi villa. Sixteen places.",
      startDate: "2026-09-15",
      endDate: "2026-10-15",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: "hack47 villa",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Delhi",
          addressCountry: "IN",
        },
      },
      organizer: { "@id": `${SITE.url}#organization` },
      url: SITE.url,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${dmMono.variable}`}>
      <body className="font-display antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <ApplyProvider>
          <SmoothAnchors />
          {children}
        </ApplyProvider>
      </body>
    </html>
  );
}
