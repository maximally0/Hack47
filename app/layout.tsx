import { Anton, IBM_Plex_Mono } from "next/font/google"
import { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://hack47.org"),
  title: {
    default: "Hack47",
    template: "%s | Hack47",
  },
  description: "Delhi's first hacker house. A 30-day residency for 16 builders who ship fast, sleep less, and build what matters. Delhi. Oct 15 – Nov 15.",
  keywords: ["hacker house", "Delhi", "residency", "builders", "startup", "coliving", "hackathon", "Hack47", "India"],
  authors: [{ name: "Hack47" }],
  creator: "Hack47",
  publisher: "Hack47",
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
    url: "https://hack47.org",
    siteName: "Hack47",
    title: "Hack47 — Delhi's First Hacker House",
    description: "30 days. 16 builders. One Delhi villa. No distractions, just shipping. Apply now.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hack47 — Delhi's First Hacker House",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hack47 — Delhi's First Hacker House",
    description: "30 days. 16 builders. One villa. Pure chaos. Apply now.",
    images: ["/og-image.png"],
    creator: "@hack47_",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, anton.variable)}
    >
      <body className="bg-black">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
