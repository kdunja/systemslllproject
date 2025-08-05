const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const loadRoutes = require("./routes/load");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", loadRoutes);



// const db = mysql.createConnection({
//   host: "88.200.63.148",
//   user: "studenti",
//   password: "S039C8R7",
//   database: "SISIII2025_89201011"
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Greška pri konekciji:", err);
//   } else {
//     console.log("Uspešno povezano na bazu MySQL!");
//   }
// });


// Početna ruta
app.get("/", (req, res) => {
  res.send("API radi 🎉");
});

// Server start
app.listen(3001, () => {
  console.log("Server je pokrenut na http://localhost:3001");
});
