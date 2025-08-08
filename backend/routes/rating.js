const express = require("express");
const router = express.Router();
const db = require("../db");

// Leave a rating
router.post("/ratings", (req, res) => {
  const { userId, authorId, stars, comment } = req.body;

  if (!userId || !authorId || !stars) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `
    INSERT INTO Rating (userId, authorId, stars, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [userId, authorId, stars, comment || ""], (err, result) => {
    if (err) {
      console.error("Error inserting rating:", err.message);
      return res.status(500).json({ error: "Server error while adding rating." });
    }

    res.status(201).json({ message: "Rating submitted successfully.", ratingId: result.insertId });
  });
});

// Get all ratings for a user
router.get("/ratings/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `SELECT * FROM Rating WHERE userId = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching ratings:", err.message);
      return res.status(500).json({ error: "Server error while fetching ratings." });
    }

    res.json(results);
  });
});

// Get average rating for a user
router.get("/ratings/average/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `SELECT AVG(stars) AS averageRating FROM Rating WHERE userId = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching average rating:", err.message);
      return res.status(500).json({ error: "Server error while calculating average rating." });
    }

    res.json({ userId, averageRating: results[0].averageRating });
  });
});

// Admin deletes a rating
router.delete("/ratings/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM Rating WHERE ratingId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting rating:", err.message);
      return res.status(500).json({ error: "Server error while deleting rating." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rating not found." });
    }

    res.json({ message: "Rating deleted successfully." });
  });
});


module.exports = router;
