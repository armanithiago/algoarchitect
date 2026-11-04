import type { ReactNode } from "react";
import { LucideProvider } from "lucide-react";

/** Icon defaults, set once (design system §5.4): 20 px, 1.75 absolute stroke. Lucide v1 hides unlabelled icons from AT. */
export function IconProvider({ children }: { children: ReactNode }) {
  return (
    <LucideProvider size={20} strokeWidth={1.75} absoluteStrokeWidth>
      {children}
    </LucideProvider>
  );
}
