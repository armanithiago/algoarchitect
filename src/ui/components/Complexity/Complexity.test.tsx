import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Complexity, parseComplexity } from "./Complexity";

describe("parseComplexity: spoken names (design system §3.4)", () => {
  const table: Array<[string, string]> = [
    ["O(1)", "O of 1"],
    ["O(log n)", "O of log n"],
    ["O(n log n)", "O of n log n"],
    ["O(n^2)", "O of n squared"],
    ["O(n^3)", "O of n cubed"],
    ["O(n^k)", "O of n to the k"],
    ["O(2^n)", "O of 2 to the n"],
    ["O(n!)", "O of n factorial"],
    ["O(V + E)", "O of V plus E"],
    ["O((V + E) log V)", "O of V plus E, log V"],
    ["O(n*m)", "O of n times m"],
    ["O(sqrt n)", "O of square root of n"],
  ];
  it.each(table)("%s is spoken %s", (value, spoken) => {
    expect(parseComplexity(value)?.spoken).toBe(spoken);
  });

  it("returns null for text that is not notation", () => {
    expect(parseComplexity("fast")).toBeNull();
  });
});

describe("Complexity", () => {
  it("renders real superscripts, hides the visual from AT and speaks the name", () => {
    const { container } = render(<Complexity value="O(n^2)" />);
    const sup = container.querySelector("sup");
    expect(sup).toHaveTextContent("2");
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent("O(n2)");
    expect(screen.getByText("O of n squared")).toHaveClass("sr-only");
    expect(container.firstElementChild).toHaveClass("notation");
  });

  it("renders the multiplication dot and root sign", () => {
    const { container } = render(
      <>
        <Complexity value="O(n*m)" />
        <Complexity value="O(sqrt n)" />
      </>,
    );
    expect(container.textContent).toContain("O(n·m)");
    expect(container.textContent).toContain("O(√n)");
  });

  it("supports the chip look and mono-lg size", () => {
    const { container } = render(<Complexity value="O(n)" chip size="mono-lg" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-hover", "rounded-sm", "text-mono-lg");
  });
});
