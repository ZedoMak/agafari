import { describe, expect, it } from "vitest";
import { accessiblePrimary } from "@/lib/theme";

describe("accessiblePrimary", () => {
  it("keeps a valid dark organization color", () => {
    expect(accessiblePrimary("#175CD3")).toBe("#175CD3");
  });

  it("falls back when a color lacks contrast against white", () => {
    expect(accessiblePrimary("#F5F5F5")).toBe("#126b50");
  });

  it("falls back for malformed values", () => {
    expect(accessiblePrimary("blue")).toBe("#126b50");
  });
});
