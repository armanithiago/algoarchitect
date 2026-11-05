import { useState } from "react";
import { VIEWBOX } from "@/domain/content/schema";
import { cx } from "@/ui/lib/cx";
import { FOCUS_GAP, NODE_R, START_RING_GAP, edgeShapes, targetName, type GraphVisual, type TargetInfo, type TargetState } from "./model";
import type { ViewProps } from "./viewTypes";

const bodyBase =
  "[vector-effect:non-scaling-stroke] transition-[fill,stroke] duration-(--duration-fast) ease-standard";
const bodyStates: Record<TargetState | "pressed", string> = {
  default: "fill-surface-raised stroke-line-strong [stroke-width:1.5px]",
  pressed: "fill-surface-pressed stroke-line-strong [stroke-width:1.5px]",
  selected: "fill-accent-subtle stroke-accent [stroke-width:3px]",
  sequenced: "fill-accent-subtle stroke-accent [stroke-width:3px]",
  correct: "fill-success-subtle stroke-success [stroke-width:3px]",
  incorrect: "fill-error-subtle stroke-error [stroke-width:3px] [stroke-dasharray:4_3]",
  dimmed: "fill-surface stroke-line [stroke-width:1.5px]",
};
const discStates: Partial<Record<TargetState, string>> = {
  sequenced: "fill-accent",
  selected: "fill-accent",
  correct: "fill-success",
  incorrect: "fill-error",
};
const numberStates: Partial<Record<TargetState, string>> = {
  sequenced: "fill-on-accent",
  selected: "fill-on-accent",
  correct: "fill-on-success",
  incorrect: "fill-on-error",
};
const glyphStates: Partial<Record<TargetState, string>> = { correct: "stroke-on-success", incorrect: "stroke-on-error" };
const pop = "motion-ok:animate-pop-in [transform-box:fill-box] [transform-origin:center]";

function Badge({ x, y, info, mode }: { x: number; y: number; info: TargetInfo; mode: ViewProps["mode"] }) {
  const cx0 = x + 15;
  const cy0 = y - 15;
  if (mode === "order" && info.position !== null) {
    return (
      <g className={pop}>
        <circle cx={cx0} cy={cy0} r={9} className={discStates[info.state] ?? "fill-accent"} />
        <text x={cx0} y={cy0 + 4} textAnchor="middle" className={cx("font-mono", numberStates[info.state] ?? "fill-on-accent")} style={{ fontSize: 11.5, fontWeight: 700 }}>
          {info.position}
        </text>
      </g>
    );
  }
  if (mode === "first" && info.state === "correct") {
    return (
      <g className={pop}>
        <circle cx={cx0} cy={cy0} r={8.5} className="fill-success" />
        <path d={`M${x + 11} ${y - 15} l3 3 l5 -6`} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={glyphStates.correct} />
      </g>
    );
  }
  if (mode === "first" && info.state === "incorrect") {
    return (
      <g className={pop}>
        <circle cx={cx0} cy={cy0} r={8.5} className="fill-error" />
        <path d={`M${x + 12} ${y - 18} l6 6 M${x + 18} ${y - 18} l-6 6`} fill="none" strokeWidth={2} strokeLinecap="round" className={glyphStates.incorrect} />
      </g>
    );
  }
  return null;
}

/** Graph and tree: SVG drawing (aria-hidden) with a 48 px HTML hit button per node on top (design system §7.4). */
export function GraphCanvas({ visual, mode, targets, infos, descs, readOnly, onTap, activeId, registerRef, onActive }: ViewProps & { visual: GraphVisual }) {
  const [focusRing, setFocusRing] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const edges = edgeShapes(visual);
  const byId = new Map(visual.nodes.map((n) => [n.id, n]));

  return (
    <div className="relative aspect-[320/240] w-full select-none" data-testid="trace-canvas-box">
      <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
        {edges.map((e) => (
          <g key={e.key}>
            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className="stroke-line-strong [stroke-width:1.5px] [vector-effect:non-scaling-stroke]" />
            {e.arrow ? <polygon points={e.arrow} className="fill-line-strong" /> : null}
            {e.weight !== undefined ? (
              <g>
                <rect
                  x={e.mid.x - (String(e.weight).length * 7.6 + 8) / 2}
                  y={e.mid.y - 9}
                  width={String(e.weight).length * 7.6 + 8}
                  height={18}
                  rx={6}
                  className="fill-surface"
                />
                <text x={e.mid.x} y={e.mid.y + 4.5} textAnchor="middle" className="fill-fg-secondary font-mono" style={{ fontSize: 12.6, fontWeight: 500 }}>
                  {e.weight}
                </text>
              </g>
            ) : null}
          </g>
        ))}
        {targets.map((t) => {
          const n = byId.get(t.id);
          const info = infos.get(t.id);
          if (!n || !info) return null;
          const isStart = visual.start === n.id;
          const visualState: TargetState | "pressed" = pressed === n.id && info.state === "default" ? "pressed" : info.state;
          return (
            <g key={n.id} data-node={n.id} data-state={info.state}>
              {focusRing === n.id ? (
                <circle cx={n.x} cy={n.y} r={NODE_R + (isStart ? START_RING_GAP : 0) + FOCUS_GAP} className="fill-none stroke-focus [stroke-width:2px] [vector-effect:non-scaling-stroke]" data-focus-ring="" />
              ) : null}
              {isStart ? (
                <>
                  <circle cx={n.x} cy={n.y} r={NODE_R + START_RING_GAP} className="fill-none stroke-fg-secondary [stroke-width:1.5px] [vector-effect:non-scaling-stroke]" />
                  <text x={n.x} y={n.y - 30} textAnchor="middle" className="fill-fg-muted font-mono" style={{ fontSize: 12.6, fontWeight: 500 }}>
                    start
                  </text>
                </>
              ) : null}
              <circle cx={n.x} cy={n.y} r={NODE_R} className={cx(bodyBase, bodyStates[visualState])} />
              <text x={n.x} y={n.y + 5} textAnchor="middle" className={cx("font-mono", info.state === "dimmed" ? "fill-fg-muted" : "fill-fg")} style={{ fontSize: 14.7, fontWeight: 600 }}>
                {n.label}
              </text>
              <Badge x={n.x} y={n.y} info={info} mode={mode} />
            </g>
          );
        })}
      </svg>
      {targets.map((t) => {
        const n = byId.get(t.id);
        const info = infos.get(t.id);
        if (!n || !info) return null;
        const base = descs.get(t.id)?.name ?? t.label;
        return (
          <button
            key={t.id}
            ref={(el) => registerRef(t.id, el)}
            type="button"
            data-trace-id={t.id}
            data-state={info.state}
            {...(mode === "first"
              ? { role: "radio" as const, "aria-checked": info.picked }
              : { "aria-pressed": info.position !== null })}
            aria-disabled={readOnly || info.locked ? true : undefined}
            aria-label={targetName(base, mode, info)}
            tabIndex={activeId === t.id ? 0 : -1}
            onClick={() => onTap(t.id)}
            onFocus={(e) => {
              onActive(t.id);
              let visible = true;
              try {
                visible = e.currentTarget.matches(":focus-visible");
              } catch {
                /* :focus-visible unsupported: show the ring */
              }
              setFocusRing(visible ? t.id : null);
            }}
            onBlur={() => setFocusRing((cur) => (cur === t.id ? null : cur))}
            onPointerDown={() => setPressed(t.id)}
            onPointerUp={() => setPressed(null)}
            onPointerCancel={() => setPressed(null)}
            onPointerLeave={() => setPressed((cur) => (cur === t.id ? null : cur))}
            style={{ left: `${((n.x / VIEWBOX.width) * 100).toFixed(3)}%`, top: `${((n.y / VIEWBOX.height) * 100).toFixed(3)}%` }}
            className={cx(
              "absolute size-12 -translate-x-1/2 -translate-y-1/2 touch-manipulation rounded-full focus-visible:outline-none",
              readOnly || info.locked ? "cursor-default" : "cursor-pointer",
            )}
          />
        );
      })}
    </div>
  );
}
