import type { ReactNode } from "react";
import { cx } from "@/ui/lib/cx";

export interface ComplexityProps {
  /** ASCII notation from content, e.g. `O(n^2)` (design system §3.4). */
  value: string;
  size?: "mono" | "mono-lg";
  /** Mono on `--surface-hover` with `radius-sm` (FeedbackSheet, BigOPicker); otherwise inline in prose. */
  chip?: boolean;
  className?: string;
}

interface Parsed {
  visual: ReactNode[];
  spoken: string;
}

const EXPONENT_WORDS: Record<string, string> = { "2": "squared", "3": "cubed" };

/** Returns the exponent text and the index after it: a run of letters/digits, or a balanced `( ... )`. */
function readExponent(s: string, from: number): { text: string; end: number } {
  if (s[from] === "(") {
    let depth = 0;
    for (let i = from; i < s.length; i++) {
      if (s[i] === "(") depth++;
      else if (s[i] === ")" && --depth === 0) return { text: s.slice(from + 1, i), end: i + 1 };
    }
    return { text: s.slice(from + 1), end: s.length };
  }
  const m = /^[A-Za-z0-9]+/.exec(s.slice(from));
  const text = m ? m[0] : "";
  return { text, end: from + text.length };
}

/** Parses `O( ... )` into visual nodes (real superscripts) and a spoken string. Pure; exported for tests. */
export function parseComplexity(value: string): Parsed | null {
  const m = /^O\(([\s\S]+)\)$/.exec(value.trim());
  if (!m) return null;
  const body = m[1]!;
  const visual: ReactNode[] = [];
  const spoken: string[] = ["O of"];
  let text = "O(";
  const flush = () => {
    if (text) visual.push(text);
    text = "";
  };
  let key = 0;
  for (let i = 0; i < body.length; ) {
    const rest = body.slice(i);
    if (rest.startsWith("sqrt")) {
      text += "√";
      spoken.push("square root of");
      i += 4;
      if (body[i] === " ") i++;
      continue;
    }
    if (rest.startsWith("log")) {
      text += "log";
      spoken.push("log");
      i += 3;
      continue;
    }
    const ch = body[i]!;
    if (ch === "^") {
      const exp = readExponent(body, i + 1);
      flush();
      visual.push(
        <sup key={key++} className="relative top-[-0.45em] align-baseline text-[0.7em] leading-[0]">
          {exp.text}
        </sup>,
      );
      const prev = spoken.pop() ?? "";
      spoken.push(`${prev} ${EXPONENT_WORDS[exp.text] ?? `to the ${exp.text}`}`.trim());
      i = exp.end;
      continue;
    }
    if (ch === "*") {
      text += "·";
      spoken.push("times");
    } else if (ch === "+") {
      text += "+";
      spoken.push("plus");
    } else if (ch === "!") {
      text += "!";
      const prev = spoken.pop() ?? "";
      spoken.push(`${prev} factorial`.trim());
    } else if (ch === "(") {
      text += "(";
    } else if (ch === ")") {
      text += ")";
      // "(V + E) log V" is spoken "V plus E, log V": a pause where the group closes.
      const prev = spoken.pop() ?? "";
      spoken.push(`${prev},`);
    } else if (ch === " ") {
      text += " ";
    } else {
      text += ch;
      spoken.push(ch);
    }
    i++;
  }
  text += ")";
  flush();
  const spokenText = spoken
    .join(" ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { visual, spoken: spokenText };
}

/**
 * The only place complexity notation is formatted (design system §3.4, §7.22). Mono, ligatures off, never wraps;
 * real superscripts for exponents; the spoken name is a visually hidden string (never `aria-label` on a bare span).
 */
export function Complexity({ value, size = "mono", chip = false, className }: ComplexityProps) {
  const parsed = parseComplexity(value);
  return (
    <span
      data-complexity={value}
      className={cx(
        "notation inline-flex items-baseline font-medium text-fg",
        size === "mono-lg" ? "text-mono-lg" : "text-mono",
        chip && "rounded-sm bg-surface-hover px-2 py-0.5",
        className,
      )}
    >
      <span aria-hidden="true">{parsed ? parsed.visual : value}</span>
      <span className="sr-only">{parsed ? parsed.spoken : value}</span>
    </span>
  );
}
