"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Sidebar from "@/components/sidebar/sidebar";
import Header from "@/components/header/Header";
import { ThemeProvider } from "next-themes";
import FloatingSidebar from "@/components/sidebar/floatingSidebar";
import { useEffect, useState } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSm, setIsSm] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSm(window.innerWidth < 768); // sm breakpoint in Tailwind
    handleResize(); // set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex flex-row px-0 md:px-7.5 py-5 h-screen w-screen gap-7.5 overflow-hidden">
          {isSm ? <FloatingSidebar /> : <Sidebar />}

          <div className="flex flex-col w-full">
            <Header />
            <div className="overflow-y-auto scrollbar-hide">
              {children}
            </div>
            
          </div>
        </div>
      </ThemeProvider>
    
  );
}
