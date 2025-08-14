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

router.post("/messages", (req, res) => {
  const { senderId, recipientId, text } = req.body || {};
  const sId = toInt(senderId);
  const rId = toInt(recipientId);
  const body = String(text || "").trim();
  if (!sId || !rId || !body) return fail(res, 400, "Fields 'senderId', 'recipientId', and 'text' are required.");
  if (body.length > 2000) return fail(res, 400, "Text too long (max 2000).");

  const sql = `
    INSERT INTO message (senderId, recipientId, text, timestamp)
    VALUES (?, ?, ?, NOW())
  `;
  db.query(sql, [sId, rId, body], (err, result) => {
    if (err) return fail(res, 500, "Server error while sending message.");
    return ok(res, { message: "Message sent.", messageId: result.insertId }, 201);
  });
});

router.get("/messages/:userId", (req, res) => {
  const userId = toInt(req.params.userId);
  if (!userId) return fail(res, 400, "Invalid 'userId'.");

  const box = String(req.query.box || "inbox").toLowerCase(); // inbox|sent|all
  const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);
  const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

  let where = "recipientId = ?";
  let params = [userId, limit, offset];
  if (box === "sent") {
    where = "senderId = ?";
  } else if (box === "all") {
    where = "(senderId = ? OR recipientId = ?)";
    params = [userId, userId, limit, offset];
  }

  const sql = `
    SELECT messageId, senderId, recipientId, text, timestamp
    FROM message
    WHERE ${where}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, params, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching messages.");
    return ok(res, { data: rows, limit, offset, box });
  });
});

router.get("/messages/conversation/:user1/:user2", (req, res) => {
  const u1 = toInt(req.params.user1);
  const u2 = toInt(req.params.user2);
  if (!u1 || !u2) return fail(res, 400, "Invalid user ids.");

  const limit = Math.min(Math.max(parseInt(req.query.limit || "200", 10), 1), 500);
  const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

  const sql = `
    SELECT messageId, senderId, recipientId, text, timestamp
    FROM message
    WHERE (senderId = ? AND recipientId = ?)
       OR (senderId = ? AND recipientId = ?)
    ORDER BY timestamp ASC
    LIMIT ? OFFSET ?
  `;
  db.query(sql, [u1, u2, u2, u1, limit, offset], (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching conversation.");
    return ok(res, { data: rows, limit, offset });
  });
});

router.delete("/messages/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid 'id'.");
  db.query("DELETE FROM message WHERE messageId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting message.");
    if (result.affectedRows === 0) return fail(res, 404, "Message not found.");
    return ok(res, { message: "Message deleted." });
  });
});

module.exports = router;
