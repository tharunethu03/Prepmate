"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useDarkMode } from "./useDarkMode";

const navLinks = [
  { label: "Features", id: "features" },
  { label: "How it works", id: "how-it-works" },
  { label: "Benefits", id: "benefits" },
  { label: "Platform", id: "screenshots" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isDark = useDarkMode();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    setOpen(false);
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-5xl">
        {/* ── Floating pill bar ── */}
        <div
          className={`flex items-center justify-between h-15 px-5 rounded-2xl border transition-all duration-300 ${
            scrolled
              ? "bg-background/92 backdrop-blur-2xl border-border/70 shadow-xl shadow-black/[0.08] dark:shadow-black/30"
              : "bg-background/75 backdrop-blur-xl border-border/40 shadow-lg shadow-black/[0.04]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={isDark ? "/logo-dark.png" : "/logo.png"}
              alt="Prepmate"
              width={120}
              height={30}
              className="object-contain"
              style={{ imageRendering: "pixelated" }}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={`/#${l.id}`}
                onClick={(e) => handleNavClick(e, l.id)}
                className="text-sm font-medium text-secondary hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="h-9 px-4 text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="h-9 px-5 text-sm font-semibold !rounded-xl">
                Get started
              </Button>
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-secondary hover:text-primary hover:bg-border/50 transition-colors"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile dropdown (drops below the pill) ── */}
        {open && (
          <div className="mt-2 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/60 shadow-xl px-4 py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={`/#${l.id}`}
                onClick={(e) => handleNavClick(e, l.id)}
                className="text-sm font-medium text-secondary hover:text-primary hover:bg-border/40 rounded-xl px-3 py-2.5 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 pt-2 border-t border-border flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full h-10">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full h-10">Get started free</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
