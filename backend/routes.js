const express = require("express");
const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true, api: "up" });
});

// Mount sub-routers with clear prefixes
router.use("/auth", require("./routes/auth"));
router.use("/loads", require("./routes/load"));
router.use("/cargo", require("./routes/cargo"));
router.use("/message", require("./routes/message"));
router.use("/rating", require("./routes/rating"));
router.use("/admin", require("./routes/admin"));

// Fallback 404 for unknown API routes
router.use((req, res) => {
  res.status(404).json({ ok: false, error: "API route not found" });
});

module.exports = router;
