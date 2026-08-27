import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "A pet that lives off your commits. Install it on a GitHub repo and watch it grow from egg to adult as the team ships.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Commit Pet",
    template: "%s · Commit Pet",
  },
  description: DESCRIPTION,
  applicationName: "Commit Pet",
  openGraph: {
    title: "Commit Pet",
    description: DESCRIPTION,
    siteName: "Commit Pet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Commit Pet",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FB923C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
