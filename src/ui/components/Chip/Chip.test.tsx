import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DOMAINS } from "@/ui/lib/domain";
import { Chip } from "./Chip";
import { DomainBadge } from "./DomainBadge";

describe("Chip", () => {
  it("is non-interactive text with a tone", () => {
    render(<Chip tone="accent">+10 XP</Chip>);
    const chip = screen.getByText("+10 XP");
    expect(chip).toHaveAttribute("data-tone", "accent");
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("DomainBadge", () => {
  it("subtle: text plus icon, domain tokens from the static map", () => {
    render(<DomainBadge domain="hashing" />);
    const badge = screen.getByText("Hashing").closest("span")!;
    expect(badge.className).toContain("bg-hashing-subtle");
    expect(badge.querySelector("svg")).not.toBeNull();
    expect(badge).toHaveAttribute("data-variant", "subtle");
  });

  it("dot: neutral chip with a domain dot and an optional count", () => {
    render(<DomainBadge domain="graphs" variant="dot" count={3} />);
    const badge = screen.getByText("Graphs").closest("[data-variant]")!;
    expect(badge).toHaveAttribute("data-variant", "dot");
    expect(badge.className).toContain("bg-surface-hover");
    expect(badge.querySelector(".bg-graphs")).not.toBeNull();
    expect(badge).toHaveTextContent("Graphs3");
  });

  it("icon: labelled square with the full domain name", () => {
    render(<DomainBadge domain="dp" variant="icon" />);
    const badge = screen.getByRole("img", { name: "Dynamic Programming" });
    expect(badge.className).toContain("size-8");
    expect(badge.className).toContain("bg-dp-subtle");
  });

  it("every domain uses fully written class strings (no dynamic names)", () => {
    for (const [key, meta] of Object.entries(DOMAINS)) {
      expect(meta.subtle).toBe(`bg-${key}-subtle text-${key}-fg`);
      expect(meta.dot).toBe(`bg-${key}`);
    }
  });
});
