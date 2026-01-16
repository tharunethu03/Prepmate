import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Sidebar from "@/components/sidebar/sidebar";
import Header from "@/components/header/Header";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="flex flex-row px-[30px] py-5 h-screen w-screen gap-[30px] overflow-hidden">
          <Sidebar />
          <div className="flex flex-col w-full">
            <Header />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
