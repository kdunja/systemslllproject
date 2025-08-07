const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // dodaj ovu liniju!
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Greška prilikom konekcije:", err.message);
    return;
  }
  console.log("✅ Konekcija sa bazom uspešna!");
});

module.exports = db;
