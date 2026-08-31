import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "----font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSetu — Academia–Industry Collaboration Portal",
  description:
    "Bridge the gap between academia and industry with AI-powered skill mapping, personalised internship matching, and career development tools.",
  keywords: [
    "skill mapping",
    "internships",
    "placements",
    "academia industry",
    "career development",
    "AI matching",
  ],
  openGraph: {
    title: "SkillSetu — Academia–Industry Collaboration Portal",
    description:
      "Bridge the gap between academia and industry with AI-powered skill mapping.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
