const express = require("express");
const router = express.Router();
const db = require("../db");

// Create a new load assignment
router.post("/loads", (req, res) => {
  const { userId, title, status, description } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ error: "Fields 'userId' and 'title' are required." });
  }

  const sql = `
    INSERT INTO LoadAssignment (userId, title, status, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [userId, title, status || "open", description || ""], (err, result) => {
    if (err) {
      console.error("Error while inserting load assignment:", err.message);
      return res.status(500).json({ error: "Server error while adding load assignment." });
    }

    res.status(201).json({
      message: "Load assignment successfully created.",
      loadassignmentId: result.insertId
    });
  });
});

// Get all load assignments
router.get("/loads", (req, res) => {
  const sql = "SELECT * FROM LoadAssignment";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching load assignments:", err.message);
      return res.status(500).json({ error: "Server error while fetching load assignments." });
    }

    res.json(results);
  });
});

// Get a single load assignment by ID
router.get("/loads/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM LoadAssignment WHERE loadassignmentId = ?";

  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Load assignment not found." });
    }

    res.json(results[0]);
  });
});

// Update a load assignment
router.put("/loads/:id", (req, res) => {
  const { id } = req.params;
  const { title, status, description } = req.body;

  const sql = `
    UPDATE LoadAssignment
    SET title = ?, status = ?, description = ?
    WHERE loadassignmentId = ?
  `;

  db.query(sql, [title, status, description, id], (err, result) => {
    if (err) {
      console.error("Error updating load assignment:", err.message);
      return res.status(500).json({ error: "Server error while updating load assignment." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Load assignment not found." });
    }

    res.json({ message: "Load assignment updated successfully." });
  });
});

// Delete a load assignment
router.delete("/loads/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM LoadAssignment WHERE loadassignmentId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting load assignment:", err.message);
      return res.status(500).json({ error: "Server error while deleting load assignment." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Load assignment not found." });
    }

    res.json({ message: "Load assignment deleted successfully." });
  });
});

module.exports = router;
