"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";
import { useEffect, useState } from "react";

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export const SidebarItem = ({ href, icon, label }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const [isSm, setIsSm] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSm(window.innerWidth < 768); // sm breakpoint in Tailwind
    handleResize(); // set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="flex flex-col items-start">
          <Link href={href} className="relative  md:p-0 rounded-full">
            <div className="flex flex-row items-center justify-center gap-2 md:gap-0 bg-foreground md:bg-transparent border border-border md:border-none rounded-full py-3 px-5 md:px-3">
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-accent md:bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative z-10">{icon}</div>

              {isSm && (
                <span
                  className={`relative z-10 text-sm font-semibold ${
                    isActive ? "text-foreground" : "text-primary"
                  }`}
                >
                  {label}
                </span>
              )}
            </div>
          </Link>
        </div>
      </Tooltip.Trigger>
      <TooltipContent
        side="right"
        align="center"
        className="hidden md:block rounded-[12px] border border-border"
      >
        <p className="text-sm text-secondary">{label}</p>
      </TooltipContent>
    </Tooltip.Root>
  );
};
