const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Core middleware
app.disable("x-powered-by");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Mount all API routes under /api (routes.js exports an Express router)
const apiRouter = require("./routes.js");
app.use("/api", apiRouter);

// Static frontend files (built SPA)
const clientDir = path.join(__dirname, "../client/dist");
app.use(express.static(clientDir));

// SPA catch-all for non-API paths
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

// Start server
const PORT = process.env.PORT || 5176;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://88.200.63.148:${PORT}`);
});
