import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const bn = Bebas_Neue({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymText - Daily Personalized Workouts via Text",
  description: "Get personalized daily workouts delivered straight to your phone. Transform your fitness journey with AI-powered workout recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={bn.className}>{children}</body>
    </html>
  );
}
