import type { ProofingReport, Severity } from "../lib/types.ts";

const SEVERITY_STYLES: Record<Severity, { label: string; dot: string; chip: string }> = {
  critical: { label: "Critical", dot: "bg-clay", chip: "bg-clay/10 text-clay" },
  warning: { label: "Warning", dot: "bg-amber", chip: "bg-amber/10 text-amber" },
  suggestion: { label: "Suggestion", dot: "bg-ink/40", chip: "bg-ink/5 text-ink/60" },
};

function scoreColor(score: number): string {
  if (score >= 90) return "text-leaf";
  if (score >= 70) return "text-amber";
  return "text-clay";
}

function scoreRing(score: number): string {
  if (score >= 90) return "#1f9d55";
  if (score >= 70) return "#e8a317";
  return "#d64545";
}

interface ReportProps {
  report: ProofingReport;
  previewUrl: string;
  onReset: () => void;
}

export function Report({ report, previewUrl, onReset }: ReportProps) {
  const { isPrintReady, score, summary, actionableFixes } = report;

  return (
    <div className="animate-fade-up space-y-8">
      <div className="grid gap-6 sm:grid-cols-[auto,1fr] sm:items-center">
        <div className="relative mx-auto h-32 w-32 sm:mx-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1a1a1a14" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={scoreRing(score)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 326.7} 326.7`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-4xl font-extrabold ${scoreColor(score)}`}>{score}</span>
            <span className="text-xs font-medium uppercase tracking-wide text-ink/40">/ 100</span>
          </div>
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
              isPrintReady ? "bg-leaf/10 text-leaf" : "bg-mule-50 text-mule-600"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isPrintReady ? "bg-leaf" : "bg-mule-500"}`} />
            {isPrintReady ? "Print ready" : "Needs attention"}
          </span>
          <p className="font-display text-xl font-bold leading-snug text-ink">{summary}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-chunky border border-ink/10">
        <img src={previewUrl} alt="Proofed artwork" className="max-h-72 w-full object-contain bg-cloud p-4" />
      </div>

      {actionableFixes.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/50">
            {actionableFixes.length} {actionableFixes.length === 1 ? "fix" : "fixes"} recommended
          </h2>
          <ul className="space-y-3">
            {actionableFixes.map((fix, index) => {
              const style = SEVERITY_STYLES[fix.severity];
              return (
                <li
                  key={index}
                  className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-sticker"
                >
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-ink">{fix.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.chip}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-ink/65">{fix.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="rounded-chunky border border-leaf/20 bg-leaf/5 p-5 text-center font-medium text-leaf">
          No issues found. This artwork is ready to print.
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-chunky bg-ink px-6 py-4 font-display font-bold text-white transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/20"
      >
        Proof another image
      </button>
    </div>
  );
}
