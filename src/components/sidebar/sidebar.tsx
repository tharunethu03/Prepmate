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
} from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { usePathname } from "next/navigation";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <TooltipPrimitive.Provider delayDuration={800}>
      <div className="hidden md:flex flex-col justify-between py-8 px-2.5 rounded-[22px] bg-accent-gradient  w-fit">
        <div className="flex flex-col gap-2">
          <SidebarItem
            href="/dashboard"
            label="Dashboard"
            icon={
              <LayoutGrid
                size={22}
                className={`${
                  pathname === "/dashboard" ? "text-primary" : "text-foreground"
                }`}
              />
            }
          />

          <SidebarItem
            href="/explore-interviews"
            label="Explore Interviews"
            icon={
              <Search
                size={22}
                className={`${
                  pathname === "/explore-interviews"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />

          <SidebarItem
            href="/create-interviews"
            label="Create Interviews"
            icon={
              <Pencil
                size={22}
                className={`${
                  pathname === "/create-interviews"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/saved-interviews"
            label="Saved Interviews"
            icon={
              <Bookmark
                size={22}
                className={`${
                  pathname === "/saved-interviews"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/leaderboard"
            label="Leaderboard"
            icon={
              <Trophy
                size={22}
                className={`${
                  pathname === "/leaderboard"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/challenges"
            label="Challenges"
            icon={
              <Puzzle
                size={22}
                className={`${
                  pathname === "/challenges"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <SidebarItem
            href="/about-us"
            label="About Us"
            icon={
              <Info
                size={22}
                className={`${
                  pathname === "/about-us" ? "text-primary" : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/help-center"
            label="Help Center"
            icon={
              <CircleQuestionMark
                size={22}
                className={`${
                  pathname === "/help-center"
                    ? "text-primary"
                    : "text-foreground"
                }`}
              />
            }
          />
          <SidebarItem
            href="/settings"
            label="Settings"
            icon={
              <Settings
                size={22}
                className={`${
                  pathname === "/settings" ? "text-primary" : "text-foreground"
                }`}
              />
            }
          />
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
};

export default Sidebar;
