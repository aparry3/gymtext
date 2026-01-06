import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { EnvironmentProvider } from "@/context/EnvironmentContext";

export const metadata: Metadata = {
  title: "GymText Admin - Dashboard",
  description: "GymText Admin Dashboard - Manage users, workouts, and analytics",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://admin.gymtext.com'),
  openGraph: {
    type: 'website',
    images: [{ url: '/OpenGraphGymtext.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/OpenGraphGymtext.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get initial environment mode from cookie
  const cookieStore = await cookies();
  const envCookie = cookieStore.get("gt_env");
  const initialMode = (envCookie?.value === "sandbox" ? "sandbox" : "production") as "production" | "sandbox";

  return (
    <html lang="en">
      <body>
        <EnvironmentProvider initialMode={initialMode}>
          {children}
        </EnvironmentProvider>
      </body>
    </html>
  );
}
