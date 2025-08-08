const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Add new cargo item
router.post("/cargo", (req, res) => {
  const { loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime } = req.body;

  if (!loadassignmentId || !destination || !cargotype) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `
    INSERT INTO Cargo (loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [loadassignmentId, destination, cargotype, cargoweight || 0, pickuptime, delieverytime], (err, result) => {
    if (err) {
      console.error("❌ Error inserting cargo:", err.message);
      return res.status(500).json({ error: "Server error while adding cargo." });
    }

    res.status(201).json({
      message: "✅ Cargo item added successfully.",
      cargoId: result.insertId
    });
  });
});

// ✅ Get all cargo for a specific load assignment
router.get("/cargo/:loadId", (req, res) => {
  const { loadId } = req.params;

  const sql = `SELECT * FROM Cargo WHERE loadassignmentId = ?`;

  db.query(sql, [loadId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching cargo:", err.message);
      return res.status(500).json({ error: "Server error while fetching cargo." });
    }

    res.json(results);
  });
});

// ✅ Update cargo item
router.put("/cargo/:id", (req, res) => {
  const { id } = req.params;
  const { destination, cargotype, cargoweight, pickuptime, delieverytime } = req.body;

  const sql = `
    UPDATE Cargo
    SET destination = ?, cargotype = ?, cargoweight = ?, pickuptime = ?, delieverytime = ?
    WHERE cargoId = ?
  `;

  db.query(sql, [destination, cargotype, cargoweight, pickuptime, delieverytime, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating cargo:", err.message);
      return res.status(500).json({ error: "Server error while updating cargo." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cargo item not found." });
    }

    res.json({ message: "✅ Cargo item updated successfully." });
  });
});

// ✅ Delete cargo item
router.delete("/cargo/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM Cargo WHERE cargoId = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting cargo:", err.message);
      return res.status(500).json({ error: "Server error while deleting cargo." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cargo item not found." });
    }

    res.json({ message: "✅ Cargo item deleted successfully." });
  });
});

module.exports = router;
