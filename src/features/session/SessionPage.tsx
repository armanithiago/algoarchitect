import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { XP_MATCH_CORRECT } from "@/domain/session/types";
import { isAnswerComplete } from "@/domain/session/validation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSessionStore } from "@/stores/session";
import { useProfileStore } from "@/stores/profile";
import { AnswerDock } from "@/ui/components/AnswerDock";
import { Button } from "@/ui/components/Button";
import { DomainBadge } from "@/ui/components/Chip";
import { CoachMark } from "@/ui/components/CoachMark";
import { ConfirmSheet } from "@/ui/components/ConfirmSheet";
import { FeedbackSheet, type FeedbackCheck, type FeedbackOther } from "@/ui/components/FeedbackSheet";
import { IconProvider } from "@/ui/components/Icon";
import { OptionGroup } from "@/ui/components/OptionTile";
import { SessionTopBar } from "@/ui/components/SessionTopBar";
import type { TraceView } from "@/ui/components/TraceCanvas/types";
import { VerdictStrip } from "@/ui/components/VerdictStrip";
import { haptic } from "@/ui/lib/haptics";
import { checkRowLabel } from "./validationCopy";
import { ValidationStep } from "./ValidationStep";

/** Ignore activation of the freshly relabelled Check -> Continue button for this long (design system §7.0). */
export const INPUT_GUARD_MS = 350;
const COACH_KEY = "aa.coachSeen";
const TRACE_VIEW_KEY = "aa.traceView";
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

function readTraceView(): TraceView {
  try {
    return window.localStorage.getItem(TRACE_VIEW_KEY) === "list" ? "list" : "canvas";
  } catch {
    return "canvas";
  }
}

function writeTraceView(view: TraceView): void {
  try {
    window.localStorage.setItem(TRACE_VIEW_KEY, view);
  } catch {
    // Blocked storage: the choice only lasts for this visit.
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
  const [traceView, setTraceView] = useState<TraceView>(readTraceView);
  const guardUntil = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const item = items[index];
  const scenario = item?.scenario;
  const active =
    (step.kind === "question" || step.kind === "feedback" || step.kind === "validation") &&
    scenario !== undefined;
  const validation = step.kind === "validation" ? scenario?.validations[step.index] : undefined;

  const checked = step.kind === "feedback" || (step.kind === "question" && step.checked);
  const result = scenario ? results.find((r) => r.scenarioId === scenario.id) : undefined;
  const pickedId =
    step.kind === "question"
      ? step.selectedOptionId
      : step.kind === "feedback"
        ? (result?.pickedOptionId ?? null)
        : null;

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
    if (s.step.kind === "validation") {
      const sc = s.items[s.index]?.scenario;
      const v = sc?.validations[s.step.index];
      if (!sc || !v) return;
      if (s.step.checked) {
        if (Date.now() < guardUntil.current) return;
        s.continueFromValidation();
        return;
      }
      if (!isAnswerComplete(v, s.step.answer)) return;
      const at = s.step.index;
      guardUntil.current = Date.now() + INPUT_GUARD_MS;
      s.checkValidation();
      const done = useSessionStore.getState().results.find((r) => r.scenarioId === sc.id)?.validations[at];
      haptic(done?.correct ? "correct" : "wrong", useProfileStore.getState().settings.haptics);
      return;
    }
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

  // Desktop keys: 1-4 choose (1-6 for Big-O), Enter checks / continues, Backspace undoes in order mode.
  // Never while a sheet is open.
  const keys = useRef({ onPrimary, onSelect, enabled: false });
  useEffect(() => {
    keys.current = {
      onPrimary,
      onSelect,
      enabled: active && (step.kind === "question" || step.kind === "validation") && !confirmOpen,
    };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (!k.enabled || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const live = useSessionStore.getState();
      if (live.step.kind === "validation") {
        const v = live.items[live.index]?.scenario.validations[live.step.index];
        if (v && !live.step.checked) {
          if (v.type === "bigO" && /^[1-6]$/.test(e.key)) {
            const choice = v.choices[Number(e.key) - 1];
            if (choice !== undefined) live.setAnswer({ type: "bigO", choice });
            return;
          }
          if (v.type === "traceOrder" && e.key === "Backspace") {
            const a = live.step.answer;
            if (a?.type === "order" && a.ids.length > v.givenPrefix) {
              e.preventDefault();
              live.setAnswer({ type: "order", ids: a.ids.slice(0, -1) });
            }
            return;
          }
        }
      } else if (/^[1-4]$/.test(e.key)) {
        if (live.step.kind !== "question" || live.step.checked) return;
        const id = live.items[live.index]?.optionOrder[Number(e.key) - 1];
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

  // A new session starts with focus on the scenario title; each validation starts on its question.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [active]);
  const validationIndex = step.kind === "validation" ? step.index : -1;
  useEffect(() => {
    if (validationIndex >= 0) titleRef.current?.focus({ preventScroll: true });
  }, [validationIndex]);

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

  const checks: FeedbackCheck[] = (result?.validations ?? []).flatMap((r, i) => {
    const v = scenario.validations[i];
    return v ? [{ id: String(i), label: checkRowLabel(v, r), passed: r.correct }] : [];
  });
  const passedChecks = checks.filter((c) => c.passed).length;
  const summaryLine =
    checks.length > 0
      ? `${passedChecks} of ${checks.length} ${checks.length === 1 ? "check" : "checks"} passed`
      : undefined;

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

        {step.kind === "validation" && validation ? (
          <ValidationStep
            key={step.index}
            validation={validation}
            index={step.index}
            total={scenario.validations.length}
            answer={step.answer}
            checked={step.checked}
            result={result?.validations[step.index]}
            titleRef={titleRef}
            onPrimary={onPrimary}
            traceView={traceView}
            onTraceView={(view) => {
              setTraceView(view);
              writeTraceView(view);
            }}
          />
        ) : (
          <>
            <main className="min-h-0 flex-1 touch-manipulation overflow-y-auto overscroll-y-contain">
              <div className="px-gutter mx-auto flex max-w-content flex-col gap-3 pb-6 pt-1">
                <div className="flex items-center gap-2">
                  <DomainBadge domain={scenario.domain} />
                  <span className="text-caption text-fg-muted">
                    New {"·"} D{scenario.difficulty}
                  </span>
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
                    detail={
                      correct ? `${labelOf(correctId)} is the fit.` : `Best fit: ${labelOf(correctId)}.`
                    }
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
          </>
        )}
      </div>

      <FeedbackSheet
        open={step.kind === "feedback"}
        correct={correct}
        xp={xp}
        answerLabel={labelOf(correctId)}
        explanation={scenario.explanation}
        complexity={scenario.complexity}
        others={others}
        checks={checks}
        summaryLine={summaryLine}
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
