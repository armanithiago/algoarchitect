import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { XP_MATCH_CORRECT } from "@/domain/session/types";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSessionStore } from "@/stores/session";
import { useProfileStore } from "@/stores/profile";
import { AnswerDock } from "@/ui/components/AnswerDock";
import { Button } from "@/ui/components/Button";
import { DomainBadge } from "@/ui/components/Chip";
import { CoachMark } from "@/ui/components/CoachMark";
import { ConfirmSheet } from "@/ui/components/ConfirmSheet";
import { FeedbackSheet, type FeedbackOther } from "@/ui/components/FeedbackSheet";
import { IconProvider } from "@/ui/components/Icon";
import { OptionGroup } from "@/ui/components/OptionTile";
import { SessionTopBar } from "@/ui/components/SessionTopBar";
import { VerdictStrip } from "@/ui/components/VerdictStrip";
import { haptic } from "@/ui/lib/haptics";

/** Ignore activation of the freshly relabelled Check -> Continue button for this long (design system §7.0). */
export const INPUT_GUARD_MS = 350;
const COACH_KEY = "aa.coachSeen";
const LETTERS = "ABCD";
const QUESTION = "Which approach fits best?";

function readCoachSeen(): boolean {
  try {
    return window.localStorage.getItem(COACH_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCoachSeen(): void {
  try {
    window.localStorage.setItem(COACH_KEY, "1");
  } catch {
    // Private mode or blocked storage: the hint may show again next time. Harmless.
  }
}

/** Scenario Matching (design system §8.4) and its explanation (§8.7). Outside the tab-bar shell. */
export function SessionPage() {
  const step = useSessionStore((s) => s.step);
  const items = useSessionStore((s) => s.items);
  const index = useSessionStore((s) => s.index);
  const results = useSessionStore((s) => s.results);
  const online = useOnlineStatus();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [coachSeen, setCoachSeen] = useState(readCoachSeen);
  const guardUntil = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const item = items[index];
  const scenario = item?.scenario;
  const active = (step.kind === "question" || step.kind === "feedback") && scenario !== undefined;

  const checked = step.kind === "feedback" || (step.kind === "question" && step.checked);
  const result = scenario ? results.find((r) => r.scenarioId === scenario.id) : undefined;
  const pickedId =
    step.kind === "question" ? step.selectedOptionId : step.kind === "feedback" ? (result?.pickedOptionId ?? null) : null;

  const choices = useMemo(
    () =>
      (item?.optionOrder ?? []).flatMap((id) => {
        const o = item?.scenario.options.find((x) => x.id === id);
        return o ? [{ id: o.id, label: o.label }] : [];
      }),
    [item],
  );

  const correctId = scenario?.correctOptionId ?? "";
  const correct = pickedId !== null && pickedId === correctId;
  const labelOf = (id: string | null) => scenario?.options.find((o) => o.id === id)?.label ?? "";
  const xp = result?.xp ?? (correct ? XP_MATCH_CORRECT : 0);

  const onSelect = useCallback((id: string) => useSessionStore.getState().select(id), []);

  const onPrimary = useCallback(() => {
    const s = useSessionStore.getState();
    if (s.step.kind !== "question") return;
    if (s.step.checked) {
      if (Date.now() < guardUntil.current) return; // 350 ms input guard: a double tap must not skip the verdict
      s.continueFromVerdict();
      return;
    }
    const pick = s.step.selectedOptionId;
    if (pick === null) return;
    guardUntil.current = Date.now() + INPUT_GUARD_MS;
    s.check();
    const wasCorrect = pick === s.items[s.index]?.scenario.correctOptionId;
    haptic(wasCorrect ? "correct" : "wrong", useProfileStore.getState().settings.haptics);
    if (!readCoachSeen()) writeCoachSeen();
    setCoachSeen(true);
  }, []);

  // Desktop keys: 1-4 choose, Enter checks / continues. Never while a sheet is open.
  const keys = useRef({ onPrimary, onSelect, enabled: false });
  useEffect(() => {
    keys.current = { onPrimary, onSelect, enabled: active && step.kind === "question" && !confirmOpen };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (!k.enabled || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (/^[1-4]$/.test(e.key)) {
        const s = useSessionStore.getState();
        if (s.step.kind !== "question" || s.step.checked) return;
        const id = s.items[s.index]?.optionOrder[Number(e.key) - 1];
        if (id) k.onSelect(id);
        return;
      }
      if (e.key === "Enter") {
        // A focused non-radio button (Check, [X], Got it) handles Enter natively.
        if (target?.closest("button") && target.getAttribute("role") !== "radio") return;
        e.preventDefault();
        k.onPrimary();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A new session starts with focus on the scenario title.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [active]);

  if (step.kind === "summary") return <Navigate to="/summary" replace />;
  if (!active || !scenario || !item) return <Navigate to="/" replace />;

  const selected = step.kind === "question" ? step.selectedOptionId : pickedId;
  const letterOf = (id: string) => LETTERS[choices.findIndex((c) => c.id === id)] ?? "";
  const showCoach = !coachSeen && index === 0 && step.kind === "question" && !step.checked;
  const last = index === items.length - 1;

  const others: FeedbackOther[] = choices
    .filter((c) => c.id !== correctId)
    .map((c) => ({
      id: c.id,
      keyLabel: letterOf(c.id),
      label: c.label,
      rationale: scenario.options.find((o) => o.id === c.id)?.rationale ?? "",
      isPick: c.id === pickedId,
    }))
    .sort((a, b) => Number(b.isPick) - Number(a.isPick));

  const announcement = !checked
    ? ""
    : correct
      ? `Correct. ${labelOf(correctId)}.${xp > 0 ? ` Plus ${xp} XP.` : ""}`
      : `Not quite. Your pick: ${labelOf(pickedId)}. Best fit: ${labelOf(correctId)}.`;

  const needsPick = !checked && selected === null;

  return (
    <IconProvider>
      <div className="flex h-dvh min-h-dvh flex-col bg-canvas">
        <SessionTopBar
          current={index + 1}
          total={items.length}
          offline={!online}
          onClose={() => setConfirmOpen(true)}
        />

        <main className="min-h-0 flex-1 touch-manipulation overflow-y-auto overscroll-y-contain">
          <div className="px-gutter mx-auto flex max-w-content flex-col gap-3 pb-6 pt-1">
            <div className="flex items-center gap-2">
              <DomainBadge domain={scenario.domain} />
              <span className="text-caption text-fg-muted">New {"·"} D{scenario.difficulty}</span>
            </div>
            <h1 ref={titleRef} tabIndex={-1} className="text-title-2 text-fg outline-none">
              {scenario.title}
            </h1>
            <p className="text-body-lg text-fg">{scenario.prompt}</p>
            <p id="question-label" className="mt-1 text-body font-semibold text-fg-secondary">
              {QUESTION}
            </p>
          </div>
        </main>

        <AnswerDock
          announcement={announcement}
          coach={
            showCoach ? (
              <CoachMark
                onDismiss={() => {
                  writeCoachSeen();
                  setCoachSeen(true);
                }}
              >
                Tap the approach that fits best, then Check.
              </CoachMark>
            ) : null
          }
          verdict={
            checked ? (
              <VerdictStrip
                silent
                correct={correct}
                xp={xp}
                detail={correct ? `${labelOf(correctId)} is the fit.` : `Best fit: ${labelOf(correctId)}.`}
              />
            ) : null
          }
          action={
            <>
              <Button
                size="lg"
                disabled={needsPick}
                aria-describedby={needsPick ? "dock-hint" : undefined}
                onClick={onPrimary}
              >
                {checked ? "Continue" : "Check"}
              </Button>
              {needsPick ? (
                <span id="dock-hint" className="sr-only">
                  Select an answer first
                </span>
              ) : null}
            </>
          }
        >
          <OptionGroup
            labelledBy="question-label"
            options={choices}
            selectedId={selected}
            verdict={checked ? { correctId, pickedId } : null}
            onSelect={onSelect}
          />
        </AnswerDock>
      </div>

      <FeedbackSheet
        open={step.kind === "feedback"}
        correct={correct}
        xp={xp}
        answerLabel={labelOf(correctId)}
        explanation={scenario.explanation}
        complexity={scenario.complexity}
        others={others}
        last={last}
        onNext={() => useSessionStore.getState().nextScenario()}
        returnFocus={() => titleRef.current}
      />

      <ConfirmSheet
        open={confirmOpen}
        title="End this session?"
        body={`Your ${results.length} ${results.length === 1 ? "answer is" : "answers are"} saved. Finish a session to count today's streak.`}
        confirmLabel="End session"
        cancelLabel="Keep going"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          useSessionStore.getState().end();
        }}
      />
    </IconProvider>
  );
}
