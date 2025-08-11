const express = require("express");
const router = express.Router();
const db = require("../db");

/* ===================== USERS ===================== */

// Get all users (sa is_active)
router.get("/users", (req, res) => {
  const sql = "SELECT userId, username, email, role, is_active FROM `user`";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ error: "Server error while fetching users." });
    }
    res.json(results);
  });
});

// Add a new user
router.post("/users", (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  const sql = `
    INSERT INTO \`user\` (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [username, email, password, role || "user"], (err, result) => {
    if (err) {
      console.error("Error adding user:", err.message);
      return res.status(500).json({ error: "Server error while adding user." });
    }
    res.status(201).json({ message: "User added successfully.", userId: result.insertId });
  });
});

// Edit user (username, email, role)
router.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  const sql = `
    UPDATE \`user\`
    SET username = ?, email = ?, role = ?
    WHERE userId = ?
  `;
  db.query(sql, [username, email, role, id], (err, result) => {
    if (err) {
      console.error("Error updating user:", err.message);
      return res.status(500).json({ error: "Server error while updating user." });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found." });
    res.json({ message: "User updated successfully." });
  });
});

// Suspend/activate user (is_active: 0/1)
router.patch("/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body; // 0 ili 1
  const sql = "UPDATE `user` SET is_active = ? WHERE userId = ?";
  db.query(sql, [is_active, id], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err.message);
      return res.status(500).json({ error: "Server error while updating status." });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found." });
    res.json({ message: "User status updated." });
  });
});

// Delete user by ID
router.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM `user` WHERE userId = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err.message);
      return res.status(500).json({ error: "Server error while deleting user." });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found." });
    res.json({ message: "User deleted successfully." });
  });
});

/* ===================== LOADS ===================== */

// List all loads + cargo count + author
router.get("/loads", (req, res) => {
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
    GROUP BY l.loadassignmentId
    ORDER BY l.timestamp DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Error fetching loads:", err.message);
      return res.status(500).json({ error: "Server error while fetching loads." });
    }
    res.json(rows);
  });
});

// Delete a load (and its cargo)
router.delete("/loads/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM cargo WHERE loadassignmentId = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting cargo for load:", err.message);
      return res.status(500).json({ error: "Server error while deleting cargo." });
    }
    db.query("DELETE FROM loadassignment WHERE loadassignmentId = ?", [id], (err2, result2) => {
      if (err2) {
        console.error("Error deleting load:", err2.message);
        return res.status(500).json({ error: "Server error while deleting load." });
      }
      if (result2.affectedRows === 0) return res.status(404).json({ error: "Load not found." });
      res.json({ message: "Load (and cargo) deleted successfully." });
    });
  });
});

/* ===================== RATINGS ===================== */

router.get("/ratings", (req, res) => {
  const { userId } = req.query;
  const base = `
    SELECT ratingId, userId, authorId, stars, comment, timestamp
    FROM rating
  `;
  const sql = userId ? base + " WHERE userId = ? ORDER BY timestamp DESC"
                     : base + " ORDER BY timestamp DESC";
  db.query(sql, userId ? [userId] : [], (err, rows) => {
    if (err) {
      console.error("Error fetching ratings:", err.message);
      return res.status(500).json({ error: "Server error while fetching ratings." });
    }
    res.json(rows);
  });
});

router.delete("/ratings/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM rating WHERE ratingId = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting rating:", err.message);
      return res.status(500).json({ error: "Server error while deleting rating." });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "Rating not found." });
    res.json({ message: "Rating deleted successfully." });
  });
});

/* ===================== MESSAGES ===================== */

router.get("/messages", (req, res) => {
  const { userId } = req.query;
  const base = `
    SELECT messageId, senderId, recipientId, text, timestamp
    FROM message
  `;
  const sql = userId
    ? base + " WHERE senderId = ? OR recipientId = ? ORDER BY timestamp DESC"
    : base + " ORDER BY timestamp DESC";
  const params = userId ? [userId, userId] : [];
  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching messages:", err.message);
      return res.status(500).json({ error: "Server error while fetching messages." });
    }
    res.json(rows);
  });
});

router.delete("/messages/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM message WHERE messageId = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting message:", err.message);
      return res.status(500).json({ error: "Server error while deleting message." });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "Message not found." });
    res.json({ message: "Message deleted successfully." });
  });
});

/* ===================== DASHBOARD / STATS ===================== */

router.get("/stats", (req, res) => {
  const countsSql = `
    SELECT
      (SELECT COUNT(*) FROM \`user\`)          AS users,
      (SELECT COUNT(*) FROM loadassignment)   AS loads,
      (SELECT COUNT(*) FROM rating)           AS ratings,
      (SELECT COUNT(*) FROM message)          AS messages
  `;
  const statusSql = `
    SELECT status, COUNT(*) AS count
    FROM loadassignment
    GROUP BY status
  `;
  db.query(countsSql, (err, countsRows) => {
    if (err) {
      console.error("Error fetching counts:", err.message);
      return res.status(500).json({ error: "Server error while fetching counts." });
    }
    db.query(statusSql, (err2, statusRows) => {
      if (err2) {
        console.error("Error fetching status counts:", err2.message);
        return res.status(500).json({ error: "Server error while fetching status counts." });
      }
      res.json({ counts: countsRows[0], statusCounts: statusRows });
    });
  });
});

module.exports = router;


