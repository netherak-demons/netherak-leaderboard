import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BackgroundOverlay from "./components/BackgroundOverlay";
import ObservationBanner from "./components/ObservationBanner";
import ErrorBoundary from "./components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://leaderboard.netherak.com";

export const metadata: Metadata = {
  title: {
    default: "Netherak Leaderboard",
    template: "%s | Netherak Leaderboard",
  },
  description:
    "Season statistics and leaderboards for Netherak Demons. Connect your wallet to view your stats, rankings, and rewards.",
  keywords: ["Netherak", "leaderboard", "Somnia", "gaming", "rankings", "stats"],
  openGraph: {
    title: "Netherak Leaderboard",
    description:
      "Season statistics and leaderboards for Netherak Demons. Connect your wallet to view your stats.",
    url: siteUrl,
    siteName: "Netherak Leaderboard",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Netherak Leaderboard - Season statistics and rankings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Netherak Leaderboard",
    description:
      "Season statistics and leaderboards for Netherak Demons. Connect your wallet to view your stats.",
    images: ["/opengraph-image"],
  },
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <BackgroundOverlay />
          <ObservationBanner />
          <div className="relative z-10 flex min-h-screen flex-col max-w-[1440px] mx-auto w-full">
            <Header />
            <main className="flex-1">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
