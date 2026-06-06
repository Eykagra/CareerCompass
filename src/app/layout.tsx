import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerCompass — AI career roadmaps with a mentor",
  description:
    "Tell CareerCompass your goal and where you are today. Get a personalized, branching career roadmap and an AI mentor that guides you every step.",
  keywords: [
    "career roadmap",
    "AI mentor",
    "learning path",
    "career planning",
    "upskilling",
  ],
  openGraph: {
    title: "CareerCompass",
    description: "Personalized, branching career roadmaps with an AI mentor.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
