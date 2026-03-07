import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (class name utility)", () => {
  it("merges class names correctly", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("handles falsy values", () => {
    const result = cn("base-class", false, null, undefined, "other-class");
    expect(result).toBe("base-class other-class");
  });

  it("merges Tailwind conflicts correctly", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
