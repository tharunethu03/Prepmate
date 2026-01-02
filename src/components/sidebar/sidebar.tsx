"use client";
import {
  LayoutGrid,
  Search,
  Pencil,
  Bookmark,
  Trophy,
  Puzzle,
  Info,
  CircleQuestionMark,
  Settings,
  LogOut,
} from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";
const Sidebar = () => {
  const pathname = usePathname();

  return (
    <TooltipPrimitive.Provider delayDuration={800}>
      <div className="flex flex-col justify-between py-8 px-3 rounded-[22px] bg-accent-gradient h-screen w-fit">
        <div className="flex flex-col gap-2">
          <SidebarItem
            href="/dashboard/dashboard"
            label="Dashboard"
            icon={
              <LayoutGrid
                size={22}
                className={`${
                  pathname === "/dashboard/dashboard"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
                  
          <SidebarItem
            href="/dashboard/explore-interviews"
            label="Explore Interviews"
            icon={
              <Search
                size={22}
                className={`${
                  pathname === "/dashboard/explore-interviews"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />

          <SidebarItem
            href="/dashboard/create-interviews"
            label="Create Interviews"
            icon={
              <Pencil
                size={22}
                className={`${
                  pathname === "/dashboard/create-interviews"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/dashboard/saved-interviews"
            label="Saved Interviews"
            icon={
              <Bookmark
                size={22}
                className={`${
                  pathname === "/dashboard/saved-interviews"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/dashboard/leaderboard"
            label="Leaderboard"
            icon={
              <Trophy
                size={22}
                className={`${
                  pathname === "/dashboard/leaderboard"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/dashboard/challenges"
            label="Challenges"
            icon={
              <Puzzle
                size={22}
                className={`${
                  pathname === "/dashboard/challenges"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <SidebarItem
            href="/dashboard/about-us"
            label="About Us"
            icon={
              <Info
                size={22}
                className={`${
                  pathname === "/dashboard/about-us"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/dashboard/help-center"
            label="Help Center"
            icon={
              <CircleQuestionMark
                size={22}
                className={`${
                  pathname === "/dashboard/help-center"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/dashboard/settings"
            label="Settings"
            icon={
              <Settings
                size={22}
                className={`${
                  pathname === "/dashboard/settings"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button className="p-3 rounded-full cursor-pointer">
                <LogOut size={22} className="text-foreground" />
              </button>
            </TooltipPrimitive.Trigger>
            <TooltipContent
              side="right"
              align="center"
              className="rounded-[12px] border border-border"
            >
              <p className="text-sm text-secondary">Logout</p>
            </TooltipContent>
          </TooltipPrimitive.Root>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
};

export default Sidebar;
