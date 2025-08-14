const express = require("express");
const router = express.Router();
const db = require("../db");

function ok(res, data, code = 200) {
  return res.status(code).json({ ok: true, ...data });
}
function fail(res, code, message) {
  return res.status(code).json({ ok: false, error: message });
}
function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

router.post("/ratings", (req, res) => {
  const { userId, authorId, stars, comment } = req.body || {};
  const uId = toInt(userId);
  const aId = toInt(authorId);
  const s = toInt(stars);
  const text = String(comment || "").trim();

  if (!uId || !aId || s === null) return fail(res, 400, "Fields 'userId', 'authorId' and 'stars' are required.");
  if (!Number.isInteger(s) || s < 1 || s > 5) return fail(res, 400, "Field 'stars' must be an integer between 1 and 5.");
  if (text.length > 1000) return fail(res, 400, "Comment too long (max 1000).");
  if (uId === aId) return fail(res, 400, "You cannot rate yourself.");

  const sql = `
    INSERT INTO rating (userId, authorId, stars, comment, timestamp)
    VALUES (?, ?, ?, ?, NOW())
  `;
  db.query(sql, [uId, aId, s, text], (err, result) => {
    if (err) return fail(res, 500, "Server error while adding rating.");
    return ok(res, { message: "Rating submitted.", ratingId: result.insertId }, 201);
  });
});

router.get("/ratings/:userId", (req, res) => {
  const userId = toInt(req.params.userId);
  if (!userId) return fail(res, 400, "Invalid 'userId'.");

  const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);
  const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

  const sql = `
    SELECT ratingId, userId, authorId, stars, comment, timestamp
    FROM rating
    WHERE userId = ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `;
  db.query(sql, [userId, limit, offset], (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching ratings.");
    return ok(res, { data: rows, limit, offset });
  });
});

router.get("/ratings/average/:userId", (req, res) => {
  const userId = toInt(req.params.userId);
  if (!userId) return fail(res, 400, "Invalid 'userId'.");

  const sql = `SELECT AVG(stars) AS averageRating, COUNT(*) AS count FROM rating WHERE userId = ?`;
  db.query(sql, [userId], (err, rows) => {
    if (err) return fail(res, 500, "Server error while calculating average rating.");
    const avg = rows?.[0]?.averageRating;
    const count = rows?.[0]?.count || 0;
    return ok(res, { userId, averageRating: avg !== null ? Number(avg) : null, count });
  });
});

router.delete("/ratings/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid 'id'.");
  db.query("DELETE FROM rating WHERE ratingId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting rating.");
    if (result.affectedRows === 0) return fail(res, 404, "Rating not found.");
    return ok(res, { message: "Rating deleted." });
  });
});

module.exports = router;
