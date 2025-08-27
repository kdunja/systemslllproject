const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_.env";
const SALT_ROUNDS = 10;

const ROLES = ["carrier", "shipper", "admin"];

function ok(res, data, code = 200) {
  return res.status(code).json({ ok: true, ...data });
}
function fail(res, code, message) {
  return res.status(code).json({ ok: false, error: message });
}
function normalizeRole(role) {
  const r = String(role || "").trim().toLowerCase();
  return ROLES.includes(r) ? r : "carrier";
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidUsername(u) {
  return /^[a-zA-Z0-9_.-]{3,32}$/.test(u);
}

router.get("/_ping", (req, res) => {
  res.json({ ok: true, from: "auth.js" });
});


router.post("/register", (req, res) => {
  const { username, email, password, role, name, surname, phonenumber } = req.body || {};
  if (!username || !email || !password) return fail(res, 400, "Fields 'username', 'email' and 'password' are required.");
  const uname = String(username).trim();
  const mail = String(email).trim().toLowerCase();
  if (!isValidUsername(uname)) return fail(res, 400, "Username must be 3–32 chars (letters, digits, _.-).");
  if (!isValidEmail(mail)) return fail(res, 400, "Invalid email format.");
  if (String(password).length < 6) return fail(res, 400, "Password must be at least 6 characters.");
  const safeRole = normalizeRole(role);

  db.query("SELECT userId FROM `user` WHERE email = ? OR username = ? LIMIT 1", [mail, uname], (checkErr, rows) => {
    if (checkErr) return fail(res, 500, "Internal server error.");
    if (rows.length > 0) return fail(res, 409, "A user with this email or username already exists.");

    let hash;
    try { hash = bcrypt.hashSync(String(password), SALT_ROUNDS); }
    catch { return fail(res, 500, "Internal server error."); }

    const sql = "INSERT INTO `user` (username, email, password, role, name, surname, phonenumber) VALUES (?,?,?,?,?,?,?)";
    const params = [uname, mail, hash, safeRole, String(name || "").trim(), String(surname || "").trim(), String(phonenumber || "").trim()];
    db.query(sql, params, (insErr, result) => {
      if (insErr) return fail(res, 500, "Internal server error.");
      return ok(res, { message: "Registration successful.", userId: result.insertId }, 201);
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, "Fields 'email' and 'password' are required.");
  const mail = String(email).trim().toLowerCase();

  db.query("SELECT * FROM `user` WHERE email = ? LIMIT 1", [mail], (err, rows) => {
    if (err) return fail(res, 500, "Internal server error.");
    if (rows.length === 0) return fail(res, 401, "User does not exist.");

    const user = rows[0];
    if (user.is_active === 0) return fail(res, 403, "Account is deactivated.");

    let valid = false;
    try {
      if (typeof user.password === "string" && user.password.startsWith("$2")) {
        valid = bcrypt.compareSync(String(password), user.password);
      }
      if (!valid && String(user.password) === String(password)) {
        valid = true;
        const newHash = bcrypt.hashSync(String(password), SALT_ROUNDS);
        db.query("UPDATE `user` SET password = ? WHERE userId = ?", [newHash, user.userId], () => {});
      }
    } catch {
      return fail(res, 500, "Internal server error.");
    }

    if (!valid) return fail(res, 401, "Invalid password.");

    const token = jwt.sign({ userId: user.userId, role: user.role }, JWT_SECRET || "dev_secret", { expiresIn: "2h" });
    const { password: _omit, ...safeUser } = user;
    return ok(res, { message: "Login successful.", token, user: safeUser });
  });
});

function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const m = hdr.match(/^Bearer\s+(.+)$/i);
  if (!m) return fail(res, 401, "Missing Authorization: Bearer <token> header.");
  try {
    req.auth = jwt.verify(m[1], JWT_SECRET || "dev_secret");
    return next();
  } catch {
    return fail(res, 401, "Invalid or expired token.");
  }
}

router.get("/me", requireAuth, (req, res) => {
  const userId = req.auth.userId;
  db.query(
    "SELECT userId, username, email, role, name, surname, phonenumber, is_active FROM `user` WHERE userId = ? LIMIT 1",
    [userId],
    (err, rows) => {
      if (err) return fail(res, 500, "Internal server error.");
      if (rows.length === 0) return fail(res, 404, "User not found.");
      return ok(res, { user: rows[0] });
    }
  );
});

module.exports = router;


