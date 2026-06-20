import express from "express";
import cors from "cors";
import { env } from "./config.js";
import { proofingRouter } from "./routes/proofing.js";

const app = express();

app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", proofingRouter);

app.listen(env.PORT, () => {
  console.log(`Proofing service listening on http://localhost:${env.PORT}`);
});
