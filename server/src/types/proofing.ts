import { z } from "zod";

/**
 * The proofing report is the single contract shared between the AI service,
 * the HTTP layer, and the frontend. We define it once with Zod so we can both
 * validate the model's output at runtime and derive the TypeScript type from it.
 */

export const SeveritySchema = z.enum(["critical", "warning", "suggestion"]);

export const ActionableFixSchema = z.object({
  /** Short, human-readable name of the issue, e.g. "Background not transparent". */
  title: z.string().min(1),
  /** One or two sentences explaining the problem in plain language. */
  detail: z.string().min(1),
  /** How much this issue threatens a clean print. */
  severity: SeveritySchema,
});

export const ProofingReportSchema = z.object({
  /** True only when the artwork can go to print with no required changes. */
  isPrintReady: z.boolean(),
  /** Overall print-readiness score from 0 (unusable) to 100 (flawless). */
  score: z.number().int().min(0).max(100),
  /** One-line plain-language verdict shown at the top of the report. */
  summary: z.string().min(1),
  /** Ordered list of fixes, most severe first. Empty when the art is ready. */
  actionableFixes: z.array(ActionableFixSchema),
});

export type Severity = z.infer<typeof SeveritySchema>;
export type ActionableFix = z.infer<typeof ActionableFixSchema>;
export type ProofingReport = z.infer<typeof ProofingReportSchema>;
