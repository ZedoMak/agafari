import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Agafari — Launch AI-powered organization websites",
    template: "%s · Agafari",
  },
  description:
    "Choose a template, customize branding, upload your knowledge base, and launch a public website with dashboard and RAG assistant in minutes.",
  openGraph: {
    title: "Agafari — Launch AI-powered organization websites",
    description:
      "Shopify for AI organizational websites—templates, dashboard, and RAG included.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
