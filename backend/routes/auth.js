const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");



router.get("/test", (req, res) => {
  res.send("Auth ruta radi! 🔐");
});

router.post("/register", async (req, res) => {
  const { username, email, password, role, name, surname, phonenumber } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ msg: "Popuni sva obavezna polja." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Uneto:", {
      username,
      email,
      password: hashedPassword,
      role,
      name,
      surname,
      phonenumber,
    });

    return res.status(200).json({ msg: "Simulirana registracija uspešna!" });
  } catch (err) {
    return res.status(500).json({ error: "Greška pri registraciji." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Test vrednosti koje očekujemo
  const dummyUser = {
    email: "test@example.com",
    passwordHash: await bcrypt.hash("mojalozinka123", 10),
    username: "testuser",
    role: "carrier",
    userId: 1
  };

  if (email !== dummyUser.email) {
    return res.status(401).json({ msg: "Korisnik ne postoji." });
  }

  const isPasswordCorrect = await bcrypt.compare(password, dummyUser.passwordHash);

  if (!isPasswordCorrect) {
    return res.status(401).json({ msg: "Pogrešna lozinka." });
  }

  const token = jwt.sign({ id: dummyUser.userId, role: dummyUser.role }, "tajni_kljuc", { expiresIn: "1h" });

  return res.status(200).json({
    msg: "Test login uspešan!",
    token,
    user: {
      id: dummyUser.userId,
      username: dummyUser.username,
      email: dummyUser.email,
      role: dummyUser.role
    }
  });
});


module.exports = router;
