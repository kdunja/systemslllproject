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
function toMySQLDateTime(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* --------------------------- CREATE ONE CARGO --------------------------- */
router.post("/", (req, res) => {
  const { loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime } = req.body || {};
  const loadId = toInt(loadassignmentId);
  if (!loadId || !destination || !cargotype) return fail(res, 400, "Fields 'loadassignmentId', 'destination', and 'cargotype' are required.");
  const weight = toFloat(cargoweight, 0);
  const sql = `
    INSERT INTO cargo (loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [loadId, String(destination).trim(), String(cargotype).trim(), weight, pickuptime || null, delieverytime || null],
    (err, result) => {
      if (err) return fail(res, 500, "Server error while adding cargo.");
      return ok(res, { message: "Cargo item added.", cargoId: result.insertId }, 201);
    }
  );
});

/* ------------------------------ LIST CARGO ------------------------------ */
router.get("/", (req, res) => {
  const loadId = req.query.loadId ? toInt(req.query.loadId) : null;
  const sql = loadId ? "SELECT * FROM cargo WHERE loadassignmentId = ?" : "SELECT * FROM cargo ORDER BY cargoId DESC";
  const params = loadId ? [loadId] : [];
  db.query(sql, params, (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching cargo.");
    return ok(res, { data: rows });
  });
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM cargo ORDER BY cargoId DESC", (err, rows) => {
    if (err) return fail(res, 500, "Server error while fetching cargo.");
    return ok(res, { data: rows });
  });
});

/* ---------------------- CARGO BY LOAD (NATIVE PATH) --------------------- */
router.get("/by-load/:loadassignmentId", (req, res) => {
  const id = toInt(req.params.loadassignmentId);
  if (!id) return fail(res, 400, "Invalid 'loadassignmentId'.");
  db.query(
    "SELECT cargoId, loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime FROM cargo WHERE loadassignmentId = ? ORDER BY cargoId ASC",
    [id],
    (err, rows) => {
      if (err) return fail(res, 500, "Server error while fetching cargo.");
      return ok(res, { data: rows || [] });
    }
  );
});

/* ------------------------ BULK REPLACE CARGO LIST ----------------------- */
router.put("/bulk/:loadassignmentId", (req, res) => {
  const id = toInt(req.params.loadassignmentId);
  if (!id) return fail(res, 400, "Invalid 'loadassignmentId'.");
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  db.query("DELETE FROM cargo WHERE loadassignmentId = ?", [id], (delErr) => {
    if (delErr) return fail(res, 500, "Server error while clearing cargo.");

    if (items.length === 0) return ok(res, { message: "Cargo updated.", count: 0 });

    const values = items.map((it) => [
      id,
      String(it.destination || "").trim(),
      String(it.cargotype || "").trim(),
      Number(it.cargoweight) || 0,
      toMySQLDateTime(it.pickuptime),
      toMySQLDateTime(it.delieverytime),
    ]);

    const sql = "INSERT INTO cargo (loadassignmentId, destination, cargotype, cargoweight, pickuptime, delieverytime) VALUES ?";
    db.query(sql, [values], (insErr, result) => {
      if (insErr) return fail(res, 500, "Server error while inserting cargo.");
      return ok(res, { message: "Cargo updated.", count: result.affectedRows });
    });
  });
});

/* ----------------------------- UPDATE ONE ------------------------------- */
router.put("/:id", (req, res) => {
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

/* ----------------------------- DELETE ONE ------------------------------- */
router.delete("/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return fail(res, 400, "Invalid cargoId.");
  db.query("DELETE FROM cargo WHERE cargoId = ?", [id], (err, result) => {
    if (err) return fail(res, 500, "Server error while deleting cargo.");
    if (result.affectedRows === 0) return fail(res, 404, "Cargo item not found.");
    return ok(res, { message: "Cargo item deleted." });
  });
});

module.exports = router;


