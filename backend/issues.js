import express from "express";
import { fetchAllIssues } from "./fetchIssues.js";
import Issue from "./models/Issue.js";

const router = express.Router();

// GET all issues from DB
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /issues/sync → trigger GitHub fetch manually
router.post("/sync", async (req, res) => {
  try {
    await fetchAllIssues();
    res.json({ message: "✅ Issues synced" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /issues/:id/status → update status to valid/invalid
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["valid", "invalid"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'valid' or 'invalid'" });
  }

  try {
    const issue = await Issue.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!issue) return res.status(404).json({ error: "Issue not found" });

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
console.log("Router export:", router);

