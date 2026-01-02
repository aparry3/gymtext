import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { EnvironmentProvider } from "@/context/EnvironmentContext";

export const metadata: Metadata = {
  title: "GymText Admin",
  description: "GymText Admin Dashboard",
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
