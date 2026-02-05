import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://avero.ma'),
  title: "Avero - Premium Airbnb Concierge Services in Morocco",
  description: "Maximize your rental income with Avero's professional Airbnb property management in Morocco. We handle guest communication, cleaning, maintenance, and optimization while you enjoy passive income.",
  keywords: ["Airbnb concierge Morocco", "property management Morocco", "short-term rental Morocco", "Airbnb management service", "Morocco vacation rental", "Avero", "rental income Morocco", "property investment Morocco"],
  authors: [{ name: "Avero Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Avero - Premium Airbnb Concierge Services in Morocco",
    description: "Stress-free Airbnb management in Morocco. Your property, our expertise. Professional property management for vacation rentals.",
    url: "https://avero.ma",
    siteName: "Avero",
    type: "website",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1440,
        height: 720,
        alt: "Luxury apartment in Morocco managed by Avero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avero - Premium Airbnb Concierge Services in Morocco",
    description: "Stress-free Airbnb management in Morocco. Your property, our expertise.",
    images: ["/images/hero.jpg"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
