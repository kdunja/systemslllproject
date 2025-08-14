const express = require("express");
const router = express.Router();
const db = require("../db");

/* =============== helpers =============== */

const LOAD_STATUSES = ["pending", "in_progress", "completed", "canceled"];
const ROLES = ["user", "admin"];

function normalizeStatus(s) {
  if (!s) return "pending";
  const v = String(s).trim().toLowerCase();
  return LOAD_STATUSES.includes(v) ? v : "pending";
}
function toBool01(v) {
  if (v === 1 || v === "1" || v === true || v === "true") return 1;
  if (v === 0 || v === "0" || v === false || v === "false") return 0;
  return null;
}
function ok(res, data) {
  return res.status(200).json({ ok: true, data });
}
function fail(res, code, msg) {
  return res.status(code).json({ ok: false, error: msg });
}

/* ===================== USERS ===================== */

// Get all users (with is_active)
router.get("/users", (req, res) => {
  const sql = "SELECT userId, username, email, role, is_active FROM `user`";
  db.query(sql, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching users.");
    ok(res, rows);
  });
});

// Add a new user
router.post("/users", (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return fail(res, 400, "Fields 'username', 'email' and 'password' are required.");
  }
  const safeRole = ROLES.includes(String(role)) ? role : "user";
  const sql = "INSERT INTO `user` (username, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [username.trim(), email.trim(), password, safeRole], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return fail(res, 409, "Email already exists.");
      return fail(res, 500, "Server error while adding user.");
    }
    return res.status(201).json({ ok: true, message: "User added.", userId: result.insertId });
  });
});

// Edit user (username, email, role)
router.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return fail(res, 400, "Invalid userId.");
  const { username, email, role } = req.body || {};
  const safeRole = ROLES.includes(String(role)) ? role : "user";
  const sql = "UPDATE `user` SET username = ?, email = ?, role = ? WHERE userId = ?";
  db.query(sql, [username, email, safeRole, id], (err, result) => {
    if (err) return fail(res, 500, "Server error while updating user.");
    if (result.affectedRows === 0) return fail(res, 404, "User not found.");
    ok(res, { message: "User updated." });
  });
});

// Update user active status (is_active: 0 or 1)
router.patch("/users/:id/status", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return fail(res, 400, "Invalid userId.");
  const b = toBool01(req.body?.is_active);
  if (b === null) return fail(res, 400, "Field 'is_active' must be 0/1 or true/false.");
  db.query("UPDATE `user` SET is_active = ? WHERE userId = ?", [b, id], (err, result) => {
    if (err) return fail(res, 500, "Server error while updating user status.");
    if (result.affectedRows === 0) return fail(res, 404, "User not found.");
    ok(res, { message: "User status updated.", is_active: b });
  });
});

// Delete user by ID
router.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return fail(res, 400, "Invalid userId.");
  db.query("DELETE FROM `user` WHERE userId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting user.");
    if (result.affectedRows === 0) return fail(res, 404, "User not found.");
    ok(res, { message: "User deleted." });
  });
});

/* ===================== LOADS ===================== */

// Load board (filter + paging + cargoCount + author)
router.get("/loads", (req, res) => {
  const { status, q, limit: rawLimit, offset: rawOffset, sort: rawSort, dir: rawDir } = req.query;

  const where = [];
  const params = [];

  if (status) {
    where.push("l.status = ?");
    params.push(normalizeStatus(status));
  }
  if (q && String(q).trim() !== "") {
    where.push("(l.title LIKE ? OR l.description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const limit = Math.min(Math.max(parseInt(rawLimit || "50", 10), 1), 200);
  const offset = Math.max(parseInt(rawOffset || "0", 10), 0);

  const SORTABLE = new Set(["loadassignmentId", "status", "title", "timestamp"]);
  const sort = SORTABLE.has(String(rawSort)) ? String(rawSort) : "timestamp";
  const dir = String(rawDir).toLowerCase() === "asc" ? "ASC" : "DESC";

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sql = `
    SELECT 
      l.loadassignmentId,
      l.userId,
      u.username,
      l.title,
      l.description,
      l.status,
      l.timestamp,
      COUNT(c.cargoId) AS cargoCount
    FROM loadassignment l
    LEFT JOIN cargo c ON c.loadassignmentId = l.loadassignmentId
    LEFT JOIN \`user\` u ON u.userId = l.userId
    ${whereSQL}
    GROUP BY l.loadassignmentId
    ORDER BY ${sort} ${dir}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  db.query(sql, params, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching loads.");
    ok(res, rows);
  });
});

// Delete a load and its cargo
router.delete("/loads/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return fail(res, 400, "Invalid loadassignmentId.");
  db.query("DELETE FROM cargo WHERE loadassignmentId = ?", [id], (err) => {
    if (err) return fail(res, 500, "Server error while deleting cargo for load.");
    db.query("DELETE FROM loadassignment WHERE loadassignmentId = ?", [id], (err2, result2) => {
      if (err2) return fail(res, 500, "Server error while deleting load.");
      if (result2.affectedRows === 0) return fail(res, 404, "Load not found.");
      ok(res, { message: "Load and its cargo deleted." });
    });
  });
});

/* ===================== RATINGS ===================== */

// Get all ratings, optionally filter by userId
router.get("/ratings", (req, res) => {
  const userId = req.query?.userId ? Number(req.query.userId) : null;
  if (req.query?.userId && !Number.isFinite(userId)) return fail(res, 400, "Invalid userId.");
  const base = `
    SELECT ratingId, userId, authorId, stars, comment, timestamp
    FROM rating
  `;
  const sql = userId
    ? base + " WHERE userId = ? ORDER BY timestamp DESC"
    : base + " ORDER BY timestamp DESC";
  db.query(sql, userId ? [userId] : [], (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching ratings.");
    ok(res, rows);
  });
});

// Delete a rating by ID
router.delete("/ratings/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return fail(res, 400, "Invalid ratingId.");
  db.query("DELETE FROM rating WHERE ratingId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting rating.");
    if (result.affectedRows === 0) return fail(res, 404, "Rating not found.");
    ok(res, { message: "Rating deleted." });
  });
});

/* ===================== MESSAGES ===================== */

// Get all messages, optionally filter by userId (as sender or recipient)
router.get("/messages", (req, res) => {
  const userId = req.query?.userId ? Number(req.query.userId) : null;
  if (req.query?.userId && !Number.isFinite(userId)) return fail(res, 400, "Invalid userId.");
  const base = `SELECT messageId, senderId, recipientId, text, timestamp FROM message`;
  const sql = userId
    ? base + " WHERE senderId = ? OR recipientId = ? ORDER BY timestamp DESC"
    : base + " ORDER BY timestamp DESC";
  const params = userId ? [userId, userId] : [];
  db.query(sql, params, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching messages.");
    ok(res, rows);
  });
});

// Delete a message by ID
router.delete("/messages/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return fail(res, 400, "Invalid messageId.");
  db.query("DELETE FROM message WHERE messageId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting message.");
    if (result.affectedRows === 0) return fail(res, 404, "Message not found.");
    ok(res, { message: "Message deleted." });
  });
});

/* ===================== DASHBOARD / STATS ===================== */

router.get("/stats", (req, res) => {
  const countsSql = `
    SELECT
      (SELECT COUNT(*) FROM \`user\`)        AS users,
      (SELECT COUNT(*) FROM loadassignment) AS loads,
      (SELECT COUNT(*) FROM rating)         AS ratings,
      (SELECT COUNT(*) FROM message)        AS messages
  `;
  const statusSql = `
    SELECT status, COUNT(*) AS count
    FROM loadassignment
    GROUP BY status
  `;
  db.query(countsSql, (err, countsRows) => {
    if (err) return fail(res, 500, "Server error while fetching counts.");
    db.query(statusSql, (err2, statusRows) => {
      if (err2) return fail(res, 500, "Server error while fetching status counts.");
      ok(res, { counts: countsRows[0], statusCounts: statusRows });
    });
  });
});

module.exports = router;


