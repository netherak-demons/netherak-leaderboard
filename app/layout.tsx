import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import Footer from "./components/Footer";
import AppShell from "./components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Netherak Leaderboard",
  description: "Season statistics and leaderboards for Netherak",
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
          <div className="flex flex-col min-h-screen relative">
            {/* Fade overlay: black top, transparent center, black bottom */}
            <div
              className="fixed inset-0 w-full h-full pointer-events-none"
              style={{
                zIndex: 1,
                background: 'linear-gradient(to bottom, #000 0%, transparent 25%, transparent 85%, #000 100%)',
              }}
            />
            <AppShell>{children}</AppShell>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
