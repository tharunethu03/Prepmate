"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useDarkMode } from "./useDarkMode";

const companyLinks: { label: string; href: string }[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const isDark = useDarkMode();
  return (
    <footer className="py-12 px-5 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <Image
                src={isDark ? "/logo-dark.png" : "/logo.png"}
                alt="Prepmate"
                width={110}
                height={28}
                className="object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="text-xs text-tertiary leading-relaxed">
              AI-powered interview practice for every industry and role.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Product
            </p>
            <ul className="flex flex-col gap-2">
              {["Features", "How it works", "Platform"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-xs text-tertiary hover:text-primary transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Company
            </p>
            <ul className="flex flex-col gap-2">
              {companyLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs text-tertiary hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Legal
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs text-tertiary hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-tertiary">
            © {new Date().getFullYear()} Prepmate. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-tertiary">
            <Shield size={12} />
            <span>Your data is private and secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
