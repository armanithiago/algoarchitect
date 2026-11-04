/**
 * Scenario content schema (sprint plan §4.2, design system §7.2-7.4, §3.4). CONTRACT for the whole content pipeline.
 * Pure TypeScript + zod, no React. Authoring rules live here so CI fails on a bad scenario, not a user.
 */
import { z } from "zod";

export const DOMAINS = ["graphs", "dp", "trees", "sorting", "hashing"] as const;
export const DomainSchema = z.enum(DOMAINS);
export type Domain = z.infer<typeof DomainSchema>;

/** `O(n log n)`, `O(n^2)`, `O((V + E) log V)`: ASCII only (design system §3.4). */
export const COMPLEXITY_RE = /^O\((?:[A-Za-z0-9 +*^!()]|sqrt|log)+\)$/;
export const ComplexitySchema = z.string().regex(COMPLEXITY_RE, "complexity must look like O(n log n)");

/** Handbook section id, e.g. "29.2" (sprint plan §4.6). Existence is checked against the study bundle in Sprint 5. */
export const StudyRefSchema = z.object({
  sectionId: z.string().regex(/^\d{1,2}\.\d{1,2}$/, 'sectionId must look like "29.2"'),
  label: z.string().min(1).max(60).optional(),
});
export type StudyRef = z.infer<typeof StudyRefSchema>;

/* ---- Visuals for trace validations: pre-laid-out in a 320 x 240 viewBox, never auto-laid-out (risk R2). ---- */
export const VIEWBOX = { width: 320, height: 240 } as const;
const id = z.string().regex(/^[A-Za-z0-9]{1,3}$/, "node ids are 1-3 alphanumeric characters");

export const GraphVisualSchema = z.object({
  kind: z.enum(["graph", "tree"]),
  nodes: z.array(z.object({ id, label: z.string().min(1).max(3), x: z.number(), y: z.number() })).min(2),
  edges: z.array(z.object({ from: id, to: id, weight: z.number().positive().optional(), directed: z.boolean().optional() })),
  start: id.optional(),
  caption: z.string().max(60).optional(),
});
export const ArrayVisualSchema = z.object({
  kind: z.literal("array"),
  cells: z.array(z.object({ id, label: z.string().min(1).max(4) })).min(3).max(12),
  caption: z.string().max(60).optional(),
});
export const VisualSchema = z.union([GraphVisualSchema, ArrayVisualSchema]);
export type Visual = z.infer<typeof VisualSchema>;

/* ---- Validations (mini-validation steps after the scenario match) ---- */
export const BigOValidationSchema = z.object({
  type: z.literal("bigO"),
  question: z.string().min(10).max(160),
  measure: z.enum(["time", "space"]).optional(),
  choices: z.array(ComplexitySchema).min(3).max(6),
  answer: ComplexitySchema,
});
export const TraceFirstStepSchema = z.object({
  type: z.literal("traceFirstStep"),
  question: z.string().min(10).max(160),
  visual: VisualSchema,
  answerTargetId: id,
});
export const TraceOrderSchema = z.object({
  type: z.literal("traceOrder"),
  question: z.string().min(10).max(200),
  visual: VisualSchema,
  algorithm: z.enum(["bfs", "dfs", "dijkstra", "binarySearch", "inorder", "preorder", "postorder", "topoKahn"]),
  tieBreak: z.enum(["alphabetical", "authored"]),
  givenPrefix: z.number().int().min(0).max(2),
  answer: z.array(id).min(3).max(8),
});
export const ValidationSchema = z.discriminatedUnion("type", [BigOValidationSchema, TraceFirstStepSchema, TraceOrderSchema]);
export type Validation = z.infer<typeof ValidationSchema>;

/* ---- Scenario ---- */
export const OptionSchema = z.object({
  id: z.string().regex(/^[a-d]$/, "option ids are a-d"),
  label: z.string().min(1).max(28, "option label must be 28 characters or fewer (fits one line at 360 px)"),
  rationale: z.string().min(10).max(160),
});
export type ScenarioOption = z.infer<typeof OptionSchema>;

export const ScenarioSchema = z.object({
  id: z.string().regex(/^(graphs|dp|trees|sorting|hashing)-\d{3}$/, 'id must look like "graphs-007"'),
  version: z.number().int().min(1),
  domain: DomainSchema,
  concept: z.string().regex(/^[a-z0-9-]+$/, "concept is a kebab-case slug, e.g. dijkstra"),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string().min(3).max(40),
  prompt: z.string().min(40).max(280, "prompt must be 280 characters or fewer"),
  options: z.array(OptionSchema).min(3).max(4),
  correctOptionId: z.string(),
  explanation: z.string().min(40).max(420),
  complexity: z.object({ time: ComplexitySchema, space: ComplexitySchema }).optional(),
  validations: z.array(ValidationSchema).min(1).max(2),
  study: z.array(StudyRefSchema).min(1).max(2),
  tags: z.array(z.string()).max(6),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const ScenarioBundleSchema = z.object({
  schema: z.literal(1),
  contentVersion: z.number().int().min(1),
  scenarios: z.array(ScenarioSchema).min(1),
});
export type ScenarioBundle = z.infer<typeof ScenarioBundleSchema>;
