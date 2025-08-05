const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Test ruta da proveriš da li auth router radi
router.get("/test", (req, res) => {
  res.send("Auth ruta radi! 🔐");
});

// Registracija korisnika (simulacija)
router.post("/register", async (req, res) => {
  const { username, email, password, role, name, surname, phonenumber } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ msg: "Please fill in all required fields." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Simulated registration:", {
      username,
      email,
      password: hashedPassword,
      role,
      name,
      surname,
      phonenumber
    });

    return res.status(201).json({ msg: "Registration successful!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error during registration." });
  }
});

// Dummy login ruta sa fiksiranim korisnikom
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Dummy korisnik sa heširanom lozinkom
  const dummyUser = {
    email: "test@example.com",
    passwordHash: await bcrypt.hash("mojalozinka123", 10),
    username: "testuser",
    role: "carrier",
    userId: 1
  };

  if (email !== dummyUser.email) {
    return res.status(401).json({ msg: "User not found." });
  }

  const isPasswordCorrect = await bcrypt.compare(password, dummyUser.passwordHash);

  if (!isPasswordCorrect) {
    return res.status(401).json({ msg: "Wrong password." });
  }

  const token = jwt.sign({ id: dummyUser.userId, role: dummyUser.role }, "tajni_kljuc", { expiresIn: "1h" });

  return res.status(200).json({
    msg: "Login successful!",
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
