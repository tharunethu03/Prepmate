"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export const SidebarItem = ({ href, icon, label }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <Link href={href} className="relative p-3 rounded-full">
          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-foreground rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <div className="relative z-10">{icon}</div>
        </Link>
      </Tooltip.Trigger>
      <TooltipContent
        side="right"
        align="center"
        className="rounded-[12px] border border-border"
      >
        <p className="text-sm text-secondary">{label}</p>
      </TooltipContent>
    </Tooltip.Root>
  );
};
