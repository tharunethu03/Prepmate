import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PREPMATE",
  description: "AI Interview Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning here and on body because browser extensions
    // (like ColorZilla) inject attributes onto those elements after hydration,
    // causing React to log a warning that doesn't actually mean anything is broken
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-background text-foreground light`}
        suppressHydrationWarning
      >
        {/* ThemeProvider wraps everything so any component in the tree can
            call useTheme() — attribute="class" means it sets dark/light on <html> */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <Toaster position="top-center" />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
