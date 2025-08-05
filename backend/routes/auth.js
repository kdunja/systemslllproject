const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Test ruta da proveriš da li auth router radi
router.get("/test", (req, res) => {
  res.send("Auth ruta radi! 🔐");
});

router.post("/register", async (req, res) => {
  const { username, email, password, role, name, surname, phonenumber } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ msg: "Please fill in all required fields." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ovde ide insert u bazu, sada simulacija
    console.log("Simulated registration:", { username, email, password: hashedPassword, role, name, surname, phonenumber });

    return res.status(201).json({ msg: "Registration successful!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error during registration." });
  }
});

module.exports = router;

