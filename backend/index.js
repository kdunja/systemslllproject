const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const loadRoutes = require("./routes/load");

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api", loadRoutes);   // Register /api/loads routes first
app.use("/api", authRoutes);   // Register /api/login and /api/register

// Test route
app.get("/", (req, res) => {
  res.send("🚚 Express server for Load Management is running!");
});

// Start the server
const PORT = process.env.PORT || 7210;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
