import { Router, type Request, type Response } from "express";
import multer from "multer";
import { inspectArtwork, ProofingError } from "../services/visionService.js";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Unsupported file type. Upload a PNG, JPEG, or WebP image."));
    }
  },
});

export const proofingRouter = Router();

/**
 * POST /api/proof
 * Accepts a single image field named "artwork" and returns a ProofingReport.
 * This handler owns transport concerns only; all inspection logic lives in the
 * vision service.
 */
proofingRouter.post("/proof", (req: Request, res: Response) => {
  upload.single("artwork")(req, res, async (uploadError) => {
    if (uploadError instanceof multer.MulterError && uploadError.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Image is too large. The limit is 10 MB." });
    }
    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image was uploaded. Attach a file named 'artwork'." });
    }

    try {
      const report = await inspectArtwork(req.file.buffer, req.file.mimetype);
      return res.status(200).json(report);
    } catch (error) {
      if (error instanceof ProofingError) {
        console.error("Proofing failed:", error.reason ?? error.message);
        return res.status(502).json({ error: "The proofing service could not analyze this image. Try again." });
      }
      console.error("Unexpected error during proofing:", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });
});
