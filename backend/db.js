const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "studenti",
  password: process.env.DB_PASSWORD || "S039C8R7",
  database: process.env.DB_DATABASE || "SISIII2025_89201011",
  multipleStatements: false,
  charset: "utf8mb4",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
  } else {
    console.log("✅ MySQL connection established.");
  }
});

module.exports = db;
