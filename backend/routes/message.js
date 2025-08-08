const express = require("express");
const router = express.Router();
const db = require("../db");

// Send a message
router.post("/messages", (req, res) => {
  const { senderId, recipientId, text } = req.body;

  if (!senderId || !recipientId || !text) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `
    INSERT INTO Message (senderId, recipientId, text)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [senderId, recipientId, text], (err, result) => {
    if (err) {
      console.error("Error sending message:", err.message);
      return res.status(500).json({ error: "Server error while sending message." });
    }

    res.status(201).json({ message: "Message sent successfully.", messageId: result.insertId });
  });
});

// Get all messages received by a user
router.get("/messages/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `SELECT * FROM Message WHERE recipientId = ? ORDER BY timestamp DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err.message);
      return res.status(500).json({ error: "Server error while fetching messages." });
    }

    res.json(results);
  });
});

// Get conversation between two users
router.get("/messages/conversation/:user1/:user2", (req, res) => {
  const { user1, user2 } = req.params;

  const sql = `
    SELECT * FROM Message
    WHERE (senderId = ? AND recipientId = ?)
       OR (senderId = ? AND recipientId = ?)
    ORDER BY timestamp ASC
  `;

  db.query(sql, [user1, user2, user2, user1], (err, results) => {
    if (err) {
      console.error("Error fetching conversation:", err.message);
      return res.status(500).json({ error: "Server error while fetching conversation." });
    }

    res.json(results);
  });
});

// Delete message
router.delete("/messages/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM Message WHERE messageId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting message:", err.message);
      return res.status(500).json({ error: "Server error while deleting message." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.json({ message: "Message deleted successfully." });
  });
});

module.exports = router;
