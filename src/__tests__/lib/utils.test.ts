import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() — className merger", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("resolves Tailwind conflicts — last value wins", () => {
    // tailwind-merge keeps the last conflicting utility
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("ignores falsy values", () => {
    expect(cn("text-sm", false, undefined, null, "font-bold")).toBe(
      "text-sm font-bold",
    );
  });

  it("handles conditional object syntax from clsx", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe(
      "text-red-500",
    );
  });

  it("returns empty string when nothing truthy passed", () => {
    expect(cn(false, undefined)).toBe("");
  });

  it("deduplicates identical classes", () => {
    const result = cn("text-sm", "text-sm");
    expect(result).toBe("text-sm");
  });
});
