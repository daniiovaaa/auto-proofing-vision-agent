import "dotenv/config";
import { z } from "zod";

/**
 * Validate environment variables once at startup. If something required is
 * missing we fail loudly here rather than at the first request, so a
 * misconfigured deployment never reaches a user.
 */
const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  PORT: z.coerce.number().int().positive().default(3001),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;