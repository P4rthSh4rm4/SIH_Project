"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  // Suppress Next.js 15+ React 19 false positive warning about next-themes script tag
  if (typeof window !== "undefined") {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
