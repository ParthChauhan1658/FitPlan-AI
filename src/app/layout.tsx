import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fitplanai.app";

export const metadata: Metadata = {
  title: {
    default: "FitPlan AI — AI-Powered Meal Planner",
    template: "%s | FitPlan AI",
  },
  description:
    "Generate personalized meal plans based on your fitness goals, dietary preferences, and budget using AI. Powered by LLaMA 3.3-70B.",
  metadataBase: new URL(APP_URL),
  keywords: [
    "meal planner",
    "AI meal plan",
    "fitness nutrition",
    "calorie calculator",
    "TDEE",
    "macro calculator",
    "diet plan",
    "healthy eating",
    "FitPlan AI",
  ],
  authors: [{ name: "FitPlan AI" }],
  creator: "FitPlan AI",
  openGraph: {
    type: "website",
    siteName: "FitPlan AI",
    title: "FitPlan AI — AI-Powered Meal Planner",
    description:
      "Generate personalized meal plans based on your fitness goals, dietary preferences, and budget using AI.",
    url: APP_URL,
    images: [
      {
        url: "/logo/fitplan-og.png",
        width: 1200,
        height: 630,
        alt: "FitPlan AI — AI-Powered Meal Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitPlan AI — AI-Powered Meal Planner",
    description:
      "Generate personalized meal plans based on your fitness goals, dietary preferences, and budget using AI.",
    images: ["/logo/fitplan-og.png"],
    creator: "@fitplanai",
  },
  icons: {
    icon: [
      { url: "/logo/fitplan-favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo/fitplan-icon.png", sizes: "1024x1024", type: "image/png" },
    ],
    shortcut: "/logo/fitplan-favicon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
