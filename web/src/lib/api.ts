import type { ProofingReport } from "./types.ts";

/** Thrown for any non-successful proofing attempt, carrying a user-safe message. */
export class ProofingRequestError extends Error {}

/**
 * Send an image to the backend and return the parsed proofing report.
 * Resolves only on a 200 response; otherwise throws with the server's message.
 */
export async function requestProof(file: File): Promise<ProofingReport> {
  const formData = new FormData();
  formData.append("artwork", file);

  let response: Response;
  try {
    response = await fetch("/api/proof", { method: "POST", body: formData });
  } catch {
    throw new ProofingRequestError("Could not reach the proofing service. Check your connection and try again.");
  }

  if (!response.ok) {
    const fallback = "The image could not be analyzed. Please try again.";
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ProofingRequestError(body?.error ?? fallback);
  }

  return (await response.json()) as ProofingReport;
}
