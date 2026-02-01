"use client";
import { Bell, Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Title from "./Title";
import * as Tooltip from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const Header = () => {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <TooltipPrimitive.Provider delayDuration={800}>
      <div className="flex flex-row border-b border-border pb-5 w-full items-center justify-between">
        <Title />
        <div className="flex flex-row items-center gap-5">
          <div>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="ring-2 ring-accent rounded-full p-1"
                >
                  {theme === "dark" ? (
                    <Sun className="text-accent cursor-pointer w-[24px]" />
                  ) : (
                    <Moon className="text-accent cursor-pointer w-[24px]" />
                  )}
                </button>
              </Tooltip.Trigger>
              <TooltipContent
                side="bottom"
                align="center"
                className="rounded-[12px] border border-border"
              >
                <p className="text-sm text-secondary">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </p>
              </TooltipContent>
            </Tooltip.Root>
          </div>
          <div className="ring-2 ring-accent rounded-full p-1">
            <Bell className="text-accent cursor-pointer w-[24px]" />
          </div>

          <img
            src={session?.user?.avatar || "/default-avatar.png"}
            alt="AVATAR"
            onClick={() => router.push("/profile")}
            className="w-20 border border-background ring-3 ring-accent rounded-full"
          />
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
};

export default Header;
