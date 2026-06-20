import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { env } from "../config.js";
import { ProofingReportSchema, type ProofingReport } from "../types/proofing.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * The system prompt defines the model's role and the exact shape of the JSON
 * we expect back. We keep the rubric explicit so scores are consistent across
 * uploads, and we describe each field so the model never invents extra keys.
 */
const SYSTEM_PROMPT = `You are a pre-flight print inspector for a sticker and label manufacturer.
You evaluate uploaded artwork for physical print readiness and nothing else.

Judge the artwork against this rubric:
- Transparency: a die-cut sticker needs a fully transparent background. A solid or checkered-but-flattened background is a defect.
- Edge quality: edges must be crisp. Pixelation, JPEG artifacts, or soft halos around the subject lower the score.
- Resolution and detail: the art must hold up when printed small. Blurry or low-resolution art is a defect.
- Contrast and legibility: colors must stay distinct on physical media. Low contrast or thin light-on-light detail is a defect.
- Safe margins: important content should not run to the very edge, which risks being cut off.

Scoring guidance:
- 90-100: ready to print as-is.
- 70-89: printable, minor improvements recommended.
- 40-69: noticeable issues that should be fixed first.
- 0-39: not suitable for print without rework.

Set isPrintReady to true only when score is at least 90 and there are no critical fixes.
Order actionableFixes by severity, most severe first. Return an empty array when the art is ready.
Write every field in clear, native English. Be specific and practical: each fix should tell the designer what to change.`;

const USER_PROMPT = `Inspect this artwork for sticker printing and return your assessment.`;

/**
 * The JSON Schema handed to Gemini via responseSchema. This guarantees the
 * model returns syntactically valid JSON matching the exact contract expected by Zod.
 */
const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    isPrintReady: { type: Type.BOOLEAN },
    score: { type: Type.INTEGER },
    summary: { type: Type.STRING },
    actionableFixes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          detail: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["critical", "warning", "suggestion"] },
        },
        required: ["title", "detail", "severity"],
      },
    },
  },
  required: ["isPrintReady", "score", "summary", "actionableFixes"],
};

/** Raised when the model cannot produce a valid report after retries. */
export class ProofingError extends Error {
  readonly reason?: unknown;

  constructor(message: string, reason?: unknown) {
    super(message);
    this.name = "ProofingError";
    this.reason = reason;
  }
}

/**
 * Run a print-readiness inspection on a single image using Gemini.
 *
 * @param imageBuffer Raw image bytes from the upload.
 * @param mimeType    The image MIME type, e.g. "image/png".
 * @returns A validated ProofingReport.
 */
export async function inspectArtwork(imageBuffer: Buffer, mimeType: string): Promise<ProofingReport> {
  const base64Data = imageBuffer.toString("base64");
  let lastError: unknown;

  // The model occasionally returns content that passes JSON Schema but fails our
  // stricter Zod rules (for example an out-of-range score). One retry resolves
  // nearly all of these without masking a genuine outage.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [
          USER_PROMPT,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      });

      const raw = response.text;
      if (!raw) {
        throw new ProofingError("The vision model returned an empty response.");
      }

      const report = ProofingReportSchema.parse(JSON.parse(raw));

      // Keep the two readiness signals from ever contradicting each other.
      report.isPrintReady = report.isPrintReady && report.score >= 90;

      return report;
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        console.warn(`Vision service validation failed, retrying... (Attempt ${attempt})`);
      }
    }
  }

  throw new ProofingError("Could not produce a valid proofing report.", lastError);
}