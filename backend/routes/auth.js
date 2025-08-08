const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

// Tajna za JWT token (kasnije prebacujemo u .env)
const JWT_SECRET = "tajna123";

// Register
router.post("/register", async (req, res) => {
  const { username, email, password, role, name, surname, phonenumber } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "Fill out all the information" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO User (username, email, password, role, name, surname, phonenumber)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [username, email, hashedPassword, role, name, surname, phonenumber], (err, result) => {
      if (err) {
        console.error("Error:", err.message);
        return res.status(500).json({ error: "Error" });
      }

      res.status(201).json({ message: "Successful registration!" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM User WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "User does not exist." });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Wrong password." });
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Izbacujemo password pre slanja
    const { password: hashedPassword, ...safeUser } = user;

    res.json({
      message: "Login successful!",
      token,
      user: safeUser
    });
  });
});

module.exports = router;

