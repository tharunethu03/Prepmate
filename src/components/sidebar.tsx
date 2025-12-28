"use client";
import {
  Bookmark,
  CircleQuestionMark,
  Info,
  LayoutGrid,
  LogOut,
  Pencil,
  Puzzle,
  Search,
  Settings,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
  const pathname = usePathname();

  const logout = () => {
    console.log("Logging out...");
  };

  return (
    <div className="flex flex-col justify-between py-8 px-3 rounded-[22px] bg-accent h-screen w-fit">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className={`p-3 rounded-full transition
            ${pathname === "/dashboard" ? "bg-foreground" : ""}
        `}
        >
          <LayoutGrid
            size={22}
            className={`transition
            ${pathname === "/dashboard" ? "text-primary" : "text-foreground"}
        `}
          />
        </Link>
        <Link
          href="/explore-interviews"
          className={`p-3 rounded-full transition
            ${pathname === "/explore-interviews" ? "bg-foreground" : ""}
        `}
        >
          <Search
            size={22}
            className={`transition
            ${
              pathname === "/explore-interviews"
                ? "text-primary"
                : "text-foreground"
            }
        `}
          />
        </Link>
        <Link
          href="/create-interviews"
          className={`p-3 rounded-full transition
            ${pathname === "/create-interviews" ? "bg-foreground" : ""}
        `}
        >
          <Pencil
            size={22}
            className={`transition
            ${
              pathname === "/create-interviews"
                ? "text-primary"
                : "text-foreground"
            }
        `}
          />
        </Link>
        <Link
          href="/saved-interviews"
          className={`p-3 rounded-full transition
            ${pathname === "/saved-interviews" ? "bg-foreground" : ""}
        `}
        >
          <Bookmark
            size={22}
            className={`transition
            ${
              pathname === "/saved-interviews"
                ? "text-primary"
                : "text-foreground"
            }
        `}
          />
        </Link>
        <Link
          href="/leaderboard"
          className={`p-3 rounded-full transition
            ${pathname === "/leaderboard" ? "bg-foreground" : ""}
        `}
        >
          <Trophy
            size={22}
            className={`transition
            ${pathname === "/leaderboard" ? "text-primary" : "text-foreground"}
        `}
          />
        </Link>
        <Link
          href="/challenges"
          className={`p-3 rounded-full transition
            ${pathname === "/challenges" ? "bg-foreground" : ""}
        `}
        >
          <Puzzle
            size={22}
            className={`transition
            ${pathname === "/challenges" ? "text-primary" : "text-foreground"}
        `}
          />
        </Link>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/settings/about-us"
          className={`p-3 rounded-full transition
            ${pathname === "/settings/about-us" ? "bg-foreground" : ""}
        `}
        >
          <Info
            size={22}
            className={`transition
            ${
              pathname === "/settings/about-us"
                ? "text-primary"
                : "text-foreground"
            }
        `}
          />
        </Link>
        <Link
          href="/settings/help-center"
          className={`p-3 rounded-full transition
            ${pathname === "/settings/help-center" ? "bg-foreground" : ""}
        `}
        >
          <CircleQuestionMark
            size={22}
            className={`transition
            ${
              pathname === "/settings/help-center"
                ? "text-primary"
                : "text-foreground"
            }
        `}
          />
        </Link>
        <Link
          href="/settings"
          className={`p-3 rounded-full transition
            ${pathname === "/settings" ? "bg-foreground" : ""}
        `}
        >
          <Settings
            size={22}
            className={`transition
            ${pathname === "/settings" ? "text-primary" : "text-foreground"}
        `}
          />
        </Link>
        <button onClick={logout} className="p-3 rounded-full cursor-pointer">
          <LogOut size={22} className="text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
