import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/sidebar/sidebar";

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
    <html lang="en" className="">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex flex-col px-[30px] py-5 h-screen w-screen gap-[30px] ">
          <Sidebar />
          <div>{children}</div>
        </div>
      </body>
    </html>
  );
}
