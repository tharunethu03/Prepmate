import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

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
    
      <div className="flex flex-col justify-center-safe items-center h-screen p-10">
        {children}
        <p className="text-xs text-tertiary align-bottom items-baseline p-5">
          Version 1.0.0 © 2025 PREPMATE
        </p>
      </div>
    
  );
}
