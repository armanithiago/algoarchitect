import type { TraceCanvasProps } from "./types";

/** STUB: Agent T replaces this (design system §7.4, §7.23; demo/index.html `traceCanvas` is the visual reference). */
export function TraceCanvas({ labelledBy }: TraceCanvasProps) {
  return <div data-stub="trace-canvas" aria-labelledby={labelledBy} />;
}
