import { useCallback, useEffect, useState } from "react";
import { Dropzone } from "./components/Dropzone.tsx";
import { ScanningPreview } from "./components/ScanningPreview.tsx";
import { Report } from "./components/Report.tsx";
import { requestProof, ProofingRequestError } from "./lib/api.ts";
import type { ProofingReport } from "./lib/types.ts";

type Status =
  | { phase: "idle" }
  | { phase: "scanning"; previewUrl: string }
  | { phase: "done"; previewUrl: string; report: ProofingReport }
  | { phase: "error"; message: string };

export default function App() {
  const [status, setStatus] = useState<Status>({ phase: "idle" });

  // Revoke object URLs when they are no longer displayed to avoid memory leaks.
  useEffect(() => {
    const url = status.phase === "scanning" || status.phase === "done" ? status.previewUrl : null;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [status]);

  const handleFile = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setStatus({ phase: "scanning", previewUrl });

    try {
      // The UI stays in "scanning" for exactly as long as the real request takes.
      const report = await requestProof(file);
      setStatus({ phase: "done", previewUrl, report });
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      const message =
        error instanceof ProofingRequestError ? error.message : "Something went wrong. Please try again.";
      setStatus({ phase: "error", message });
    }
  }, []);

  const reset = useCallback(() => setStatus({ phase: "idle" }), []);

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-2xl flex-col px-5 py-16 sm:py-24">
        <header className="mb-12 space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-mule-50 px-4 py-1.5 text-sm font-bold text-mule-600">
            Pre-Flight
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            Catch print problems
            <br />
            before they ship.
          </h1>
          <p className="mx-auto max-w-md text-ink/60">
            Drop in your sticker artwork and get an instant print-readiness score, powered by Gemini.
          </p>
        </header>

        <section className="rounded-chunky bg-white p-6 shadow-lift sm:p-8">
          {status.phase === "idle" && <Dropzone onFileAccepted={handleFile} disabled={false} />}

          {status.phase === "scanning" && <ScanningPreview previewUrl={status.previewUrl} />}

          {status.phase === "done" && (
            <Report report={status.report} previewUrl={status.previewUrl} onReset={reset} />
          )}

          {status.phase === "error" && (
            <div className="space-y-5 text-center">
              <p role="alert" className="font-display text-lg font-bold text-clay">
                {status.message}
              </p>
              <button
                type="button"
                onClick={reset}
                className="rounded-chunky bg-mule-500 px-6 py-3 font-display font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-mule-100"
              >
                Try again
              </button>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-sm text-ink/40">
          Built as a code sample. Analysis is advisory and does not replace a human pre-flight check.
        </footer>
      </main>
    </div>
  );
}
