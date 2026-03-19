"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "group/switch peer inline-flex shrink-0 items-center rounded-full shadow-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-accent data-[state=checked]:border-accent",
        "data-[state=unchecked]:bg-secondary data-[state=unchecked]:border-border",
        "border",
        size === "default" ? "h-[1.15rem] w-8" : "h-3.5 w-6",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
          size === "default"
            ? "size-3.5 data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5"
            : "size-2.5 data-[state=checked]:translate-x-[13px] data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
