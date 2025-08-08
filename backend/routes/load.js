const express = require("express");
const router = express.Router();
const db = require("../db");


router.post("/loads", (req, res) => {
  const { userId, title, status, description } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ error: "Fields 'userId' and 'title' are required." });
  }

  const sql = `
    INSERT INTO loadassignment (userId, title, status, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [userId, title, status || "open", description || ""], (err, result) => {
    if (err) {
      console.error("Error while inserting load:", err.message);
      return res.status(500).json({ error: "Server error while adding load." });
    }

    res.status(201).json({
      message: "Load created successfully.",
      loadassignmentId: result.insertId 
    });
  });
});

// ✅ Get all load assignments
router.get("/loads", (req, res) => {
  const sql = "SELECT * FROM loadassignment";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching loads:", err.message);
      return res.status(500).json({ error: "Server error while fetching loads." });
    }

    res.json(results);
  });
});

router.get("/loads/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM loadassignment WHERE loadassignmentId = ?";

  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Load not found." });
    }

    res.json(results[0]);
  });
});


router.put("/loads/:id", (req, res) => {
  const { id } = req.params;
  const { title, status, description } = req.body;

  const sql = `
    UPDATE loadassignment
    SET title = ?, status = ?, description = ?
    WHERE loadassignmentId = ?
  `;

  db.query(sql, [title, status, description, id], (err, result) => {
    if (err) {
      console.error("Error updating load:", err.message);
      return res.status(500).json({ error: "Server error while updating load." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Load not found." });
    }

    res.json({ message: "Load updated successfully." });
  });
});

router.delete("/loads/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM loadassignment WHERE loadassignmentId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting load:", err.message);
      return res.status(500).json({ error: "Server error while deleting load." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Load not found." });
    }

    res.json({ message: "Load deleted successfully." });
  });
});

// ✅ Optional: Filter loads
router.get("/load-filter", (req, res) => {
  const { status, userId, title } = req.query;

  let sql = "SELECT * FROM loadassignment WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (userId) {
    sql += " AND userId = ?";
    params.push(userId);
  }

  if (title) {
    sql += " AND title LIKE ?";
    params.push(`%${title}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error filtering loads:", err.message);
      return res.status(500).json({ error: "Server error while filtering loads." });
    }

    res.json(results);
  });
});

module.exports = router;
