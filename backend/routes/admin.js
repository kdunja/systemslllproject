const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users
router.get("/users", (req, res) => {
  const sql = "SELECT userId, username, email, role FROM User";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      return res.status(500).json({ error: "Server error while fetching users." });
    }

    res.json(results);
  });
});

// Delete user by ID
router.delete("/user/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM User WHERE userId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err.message);
      return res.status(500).json({ error: "Server error while deleting user." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  });
});

// Delete all loads by user ID (mora druga ruta!)
router.delete("/user-loads/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = "DELETE FROM LoadAssignment WHERE userId = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user loads:", err.message);
      return res.status(500).json({ error: "Server error while deleting loads." });
    }

    res.json({ message: "All loads for user deleted successfully." });
  });
});


module.exports = router;
