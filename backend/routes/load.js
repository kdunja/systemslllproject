const express = require("express");
const router = express.Router();
const db = require("../db");

const ALLOWED = ["pending", "in_progress", "completed", "canceled"];

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
function normalizeStatus(s) {
  if (!s) return "pending";
  const v = String(s).toLowerCase().trim();
  if (["in-progress", "in_progress", "processing", "inprogress", "u obradi"].includes(v)) return "in_progress";
  if (["done", "finished", "completed", "complete", "zavrsen", "završen"].includes(v)) return "completed";
  if (["cancel", "canceled", "cancelled", "otkazan"].includes(v)) return "canceled";
  if (["open", "new"].includes(v)) return "pending";
  return ALLOWED.includes(v) ? v : "pending";
}

router.post("/", (req, res) => {
  const { userId, title, status, description } = req.body || {};
  if (!userId || !title) return fail(res, 400, "Fields 'userId' and 'title' are required.");
  const sql = `
    INSERT INTO loadassignment (userId, title, status, description)
    VALUES (?, ?, ?, ?)
  `;
  const safeStatus = normalizeStatus(status);
  db.query(sql, [toInt(userId), String(title).trim(), safeStatus, String(description || "").trim()], (err, result) => {
    if (err) return fail(res, 500, "Server error while adding load.");
    return ok(res, { message: "Load created.", loadassignmentId: result.insertId }, 201);
  });
});

router.get("/", (req, res) => {
  const { status, userId, title, q, limit: rawLimit, offset: rawOffset, sort: rawSort, dir: rawDir } = req.query || {};
  const where = [];
  const params = [];

  if (status) {
    where.push("status = ?");
    params.push(normalizeStatus(status));
  }
  if (userId) {
    const uid = toInt(userId);
    if (!uid) return fail(res, 400, "Invalid 'userId'.");
    where.push("userId = ?");
    params.push(uid);
  }
  const search = (q && String(q).trim() !== "") ? String(q).trim() : (title && String(title).trim() !== "" ? String(title).trim() : null);
  if (search) {
    where.push("title LIKE ?");
    params.push(`%${search}%`);
  }

  const limit = Math.min(Math.max(parseInt(rawLimit || "50", 10), 1), 200);
  const offset = Math.max(parseInt(rawOffset || "0", 10), 0);
  const SORTABLE = new Set(["loadassignmentId", "title", "status", "timestamp", "userId"]);
  const sort = SORTABLE.has(String(rawSort)) ? String(rawSort) : "timestamp";
  const dir = String(rawDir).toLowerCase() === "asc" ? "ASC" : "DESC";

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sql = `
    SELECT loadassignmentId, userId, title, status, description, timestamp
    FROM loadassignment
    ${whereSQL}
    ORDER BY ${sort} ${dir}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  db.query(sql, params, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching loads.");
    return ok(res, { data: rows, limit, offset });
  });
});

router.get("/filter", (req, res) => {
  req.url = "/";
  return router.handle(req, res);
});

router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid 'id'.");
  db.query("SELECT * FROM loadassignment WHERE loadassignmentId = ? LIMIT 1", [id], (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching load.");
    if (!rows || rows.length === 0) return fail(res, 404, "Load not found.");
    return ok(res, { data: rows[0] });
  });
});

router.put("/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid 'id'.");
  const { title, status, description } = req.body || {};
  const safeStatus = status !== undefined ? normalizeStatus(status) : null;
  const sql = `
    UPDATE loadassignment
    SET
      title = COALESCE(?, title),
      status = COALESCE(?, status),
      description = COALESCE(?, description)
    WHERE loadassignmentId = ?
  `;
  db.query(
    sql,
    [
      title !== undefined ? String(title).trim() : null,
      safeStatus,
      description !== undefined ? String(description).trim() : null,
      id,
    ],
    (err, result) => {
      if (err) return fail(res, 500, "Server error while updating load.");
      if (result.affectedRows === 0) return fail(res, 404, "Load not found.");
      return ok(res, { message: "Load updated." });
    }
  );
});

router.delete("/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid 'id'.");
  db.query("DELETE FROM loadassignment WHERE loadassignmentId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting load.");
    if (result.affectedRows === 0) return fail(res, 404, "Load not found.");
    return ok(res, { message: "Load deleted." });
  });
});

module.exports = router;
