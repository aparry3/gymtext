import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymText - Daily Personalized Workouts via Text",
  description: "Get personalized daily workouts delivered straight to your phone. Transform your fitness journey with AI-powered workout recommendations.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    images: [
      {
        url: '/OpenGraphGymtext.png',
        width: 1200,
        height: 630,
        alt: 'GymText - Daily Personalized Workouts via Text',
      },
      {
        url: '/IconBG.png',
        width: 600,
        height: 600,
        alt: 'GymText Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/OpenGraphGymtext.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
