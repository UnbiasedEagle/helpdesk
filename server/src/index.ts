import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
