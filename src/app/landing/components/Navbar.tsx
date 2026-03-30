"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", id: "features" },
  { label: "How it works", id: "how-it-works" },
  { label: "Benefits", id: "benefits" },
  { label: "Platform", id: "screenshots" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    setOpen(false);

    if (pathname === "/") {
      // Already on landing page — smooth scroll to section
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to landing page then scroll after load
      router.push(`/#${id}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-foreground/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Prepmate"
            width={130}
            height={32}
            className="object-contain"
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={`/#${l.id}`}
              onClick={(e) => handleNavClick(e, l.id)}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="px-5">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="px-5">Get started free</Button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-secondary hover:text-primary"
          onClick={() => setOpen((p) => !p)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-foreground px-5 py-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={`/#${l.id}`}
              onClick={(e) => handleNavClick(e, l.id)}
              className="text-sm text-secondary hover:text-primary py-1"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full">Get started free</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
