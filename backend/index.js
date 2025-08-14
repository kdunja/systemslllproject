const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/", require("./routes/auth"));        // /login, /register, /me
app.use("/loads", require("./routes/load"));   // /loads, /loads/:id, ...
app.use("/", require("./routes/cargo"));       // /cargo, /cargo/all, ...
app.use("/", require("./routes/messages"));    // /messages, /messages/:userId, ...
app.use("/", require("./routes/ratings"));     // /ratings, /ratings/average/:userId, ...

app.get("/health", (req, res) => res.json({ ok: true }));

const clientDir = path.join(__dirname, "../client/dist");
app.use(express.static(clientDir));
app.get("*", (req, res) => res.sendFile(path.join(clientDir, "index.html")));

const PORT = process.env.PORT || 5176;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://88.200.63.148:${PORT}`);
});
