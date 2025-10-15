import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import PWASetup from "@/components/pwa-setup"

export const metadata: Metadata = {
  title: {
    default: "CATUR WAKTU - Produktivitas Personal",
    template: "%s | CATUR WAKTU",
  },
  description: "Catat, Atur, Tindak, dan Ukur produktivitasmu",
  generator: "v0.app",
  metadataBase: new URL("https://catur-waktu.vercel.app"),
  applicationName: "CATUR WAKTU",
  themeColor: "#0A6CFF",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.jpg", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "https://catur-waktu.vercel.app/",
    siteName: "CATUR WAKTU",
    title: "CATUR WAKTU - Produktivitas Personal",
    description: "Catat, Atur, Tindak, dan Ukur produktivitasmu",
    images: [{ url: "/icons/icon-512.jpg", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CATUR WAKTU",
    description: "Catat, Atur, Tindak, dan Ukur produktivitasmu",
    images: ["/icons/icon-512.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <PWASetup />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
