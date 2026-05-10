"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Returns true only after hydration and only when the resolved theme is dark. */
export function useDarkMode() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && resolvedTheme === "dark";
}
