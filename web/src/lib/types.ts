// Mirrors the backend ProofingReport contract. Kept as a hand-written type so
// the frontend has zero backend dependencies; in a monorepo this would be a
// shared package instead.

export type Severity = "critical" | "warning" | "suggestion";

export interface ActionableFix {
  title: string;
  detail: string;
  severity: Severity;
}

export interface ProofingReport {
  isPrintReady: boolean;
  score: number;
  summary: string;
  actionableFixes: ActionableFix[];
}
