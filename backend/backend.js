import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import issuesRouter from "./issues.js";   // ✅ use routes folder
import { fetchAllIssues } from "./fetchIssues.js";
import Issue from "./models/Issue.js";           // ✅ fixed import

const app = express();
const PORT = process.env.PORT || 4000;

// ----------------- CHECK ENV -----------------
const requiredEnvs = ["MONGO_URI", "GITHUB_TOKEN", "GITHUB_ORG"];
for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.error(`❌ ${env} is missing in .env`);
    process.exit(1);
  }
}

console.log("✅ Environment loaded:");
console.log("  GITHUB_ORG:", process.env.GITHUB_ORG);
console.log("  PORT:", PORT);

// ----------------- MIDDLEWARE -----------------
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // allow frontend

// ----------------- MONGODB CONNECTION -----------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// ----------------- AUTO-FETCH ISSUES -----------------
const FETCH_INTERVAL = 60 * 1000; // 1 min (20*1000 for testing)
setInterval(async () => {
  console.log("⏳ Auto-fetching GitHub issues...");
  try {
    await fetchAllIssues();
    console.log("✅ Auto-fetch complete");
  } catch (err) {
    console.error("❌ Auto-fetch error:", err.message || err);
  }
}, FETCH_INTERVAL);

// ----------------- ROUTES -----------------
app.use("/issues", issuesRouter);

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
