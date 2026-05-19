const express = require("express");
const router = express.Router();
const { analyzeComplaint, getAnalysis } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/ai/analyze  - Analyze a complaint by ID
router.post("/analyze", protect, analyzeComplaint);

// GET /api/ai/analyze/:id  - Get existing analysis
router.get("/analyze/:id", protect, getAnalysis);

module.exports = router;
