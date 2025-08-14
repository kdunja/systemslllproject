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
function toFloat(v, d = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}

router.post("/cargo", (req, res) => {
  const { loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime } = req.body || {};
  const loadId = toInt(loadassignmentId);
  if (!loadId || !destination || !cargotype) return fail(res, 400, "Fields 'loadassignmentId', 'destination', and 'cargotype' are required.");
  const weight = toFloat(cargoweight, 0);
  const sql = `
    INSERT INTO cargo (loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [loadId, String(destination).trim(), String(cargotype).trim(), weight, pickuptime || null, delieverytime || null], (err, result) => {
    if (err) return fail(res, 500, "Server error while adding cargo.");
    return ok(res, { message: "Cargo item added.", cargoId: result.insertId }, 201);
  });
});

router.get("/cargo", (req, res) => {
  const loadId = req.query.loadId ? toInt(req.query.loadId) : null;
  const sql = loadId ? "SELECT * FROM cargo WHERE loadassignmentId = ?" : "SELECT * FROM cargo ORDER BY cargoId DESC";
  const params = loadId ? [loadId] : [];
  db.query(sql, params, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching cargo.");
    return ok(res, { data: rows });
  });
});

router.get("/cargo/all", (req, res) => {
  db.query("SELECT * FROM cargo ORDER BY cargoId DESC", (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching cargo.");
    return ok(res, { data: rows });
  });
});

router.put("/cargo/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid cargoId.");
  const { destination, cargotype, cargoweight, pickuptime, delieverytime } = req.body || {};
  const weight = toFloat(cargoweight, 0);
  const sql = `
    UPDATE cargo
    SET destination = ?, cargotype = ?, cargoweight = ?, pickuptime = ?, delieverytime = ?
    WHERE cargoId = ?
  `;
  db.query(sql, [destination || null, cargotype || null, weight, pickuptime || null, delieverytime || null, id], (err, result) => {
    if (err) return fail(res, 500, "Server error while updating cargo.");
    if (result.affectedRows === 0) return fail(res, 404, "Cargo item not found.");
    return ok(res, { message: "Cargo item updated." });
  });
});

router.delete("/cargo/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid cargoId.");
  db.query("DELETE FROM cargo WHERE cargoId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting cargo.");
    if (result.affectedRows === 0) return fail(res, 404, "Cargo item not found.");
    return ok(res, { message: "Cargo item deleted." });
  });
});

module.exports = router;
