import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymText Programs - Partner Portal",
  description: "Create and manage fitness programs for GymText",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://programs.gymtext.com'),
  openGraph: {
    type: 'website',
    images: [{ url: '/OpenGraphGymtext.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/OpenGraphGymtext.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
