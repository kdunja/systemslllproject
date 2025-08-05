const express = require("express");
const router = express.Router();

// Simulated load assignments
let loads = [
  {
    loadassignmentId: 1,
    userId: 1,
    title: "Trip Belgrade - Niš",
    description: "Electronics in boxes",
    status: "open",
    timestamp: new Date().toISOString()
  },
  {
    loadassignmentId: 2,
    userId: 2,
    title: "Pančevo - Zrenjanin",
    description: "Construction materials",
    status: "in-progress",
    timestamp: new Date().toISOString()
  }
];

// Simulated cargo data
let cargo = [
  {
    cargoId: 1,
    loadassignmentId: 1,
    destination: "Niš",
    cargotype: "Electronics",
    cargoweight: 500,
    pickuptime: "2025-08-05T08:00",
    delieverytime: "2025-08-05T12:00"
  },
  {
    cargoId: 2,
    loadassignmentId: 1,
    destination: "Leskovac",
    cargotype: "Electronics",
    cargoweight: 200,
    pickuptime: "2025-08-05T13:00",
    delieverytime: "2025-08-05T15:00"
  },
  {
    cargoId: 3,
    loadassignmentId: 2,
    destination: "Zrenjanin",
    cargotype: "Construction",
    cargoweight: 1500,
    pickuptime: "2025-08-05T09:00",
    delieverytime: "2025-08-05T11:00"
  }
];

// Simulated user ratings
let ratings = [
  {
    ratingId: 1,
    userId: 2,       // the one being rated
    authorId: 1,     // who gave the rating
    stars: 5,
    comment: "Great cooperation!",
    timestamp: new Date().toISOString()
  }
];

// GET all load assignments
router.get("/loadassignments", (req, res) => {
  res.status(200).json(loads);
});

// POST new load assignment
router.post("/loadassignments", (req, res) => {
  const { userId, title, description, status } = req.body;

  if (!userId || !title || !description || !status) {
    return res.status(400).json({ msg: "Please fill in all required fields." });
  }

  const newLoad = {
    loadassignmentId: loads.length + 1,
    userId,
    title,
    description,
    status,
    timestamp: new Date().toISOString()
  };

  loads.push(newLoad);
  return res.status(201).json(newLoad);
});

// DELETE load assignment
router.delete("/loadassignments/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = loads.findIndex(load => load.loadassignmentId === id);

  if (index === -1) {
    return res.status(404).json({ msg: "Load not found." });
  }

  loads.splice(index, 1);
  cargo = cargo.filter(c => c.loadassignmentId !== id); // delete related cargo

  res.json({ msg: "Load successfully deleted." });
});

// PUT update load assignment
router.put("/loadassignments/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, status } = req.body;

  const index = loads.findIndex(load => load.loadassignmentId === id);
  if (index === -1) {
    return res.status(404).json({ msg: "Load not found." });
  }

  if (!title || !description || !status) {
    return res.status(400).json({ msg: "Please fill in all required fields." });
  }

  loads[index] = {
    ...loads[index],
    title,
    description,
    status,
    timestamp: new Date().toISOString()
  };

  res.json({ msg: "Load updated successfully.", load: loads[index] });
});

// GET cargo for a specific load assignment
router.get("/cargo/:loadassignmentId", (req, res) => {
  const id = parseInt(req.params.loadassignmentId);
  const relatedCargo = cargo.filter(item => item.loadassignmentId === id);
  res.status(200).json(relatedCargo);
});

// GET all cargo
router.get("/cargo/all", (req, res) => {
  res.status(200).json(cargo);
});

// POST new cargo
router.post("/cargo", (req, res) => {
  const {
    loadassignmentId,
    destination,
    cargotype,
    cargoweight,
    pickuptime,
    delieverytime
  } = req.body;

  if (
    !loadassignmentId ||
    !destination ||
    !cargotype ||
    !cargoweight ||
    !pickuptime ||
    !delieverytime
  ) {
    return res.status(400).json({ msg: "Please fill in all cargo fields." });
  }

  const newCargo = {
    cargoId: cargo.length + 1,
    loadassignmentId,
    destination,
    cargotype,
    cargoweight,
    pickuptime,
    delieverytime
  };

  cargo.push(newCargo);
  res.status(201).json(newCargo);
});

// POST new rating
router.post("/ratings", (req, res) => {
  const { userId, authorId, stars, comment } = req.body;

  if (!userId || !authorId || !stars) {
    return res.status(400).json({ msg: "User ID, Author ID, and stars are required." });
  }

  const newRating = {
    ratingId: ratings.length + 1,
    userId,
    authorId,
    stars,
    comment: comment || "",
    timestamp: new Date().toISOString()
  };

  ratings.push(newRating);
  res.status(201).json(newRating);
});

// GET all ratings for a user
router.get("/ratings/:userId", (req, res) => {
  const id = parseInt(req.params.userId);
  const userRatings = ratings.filter(r => r.userId === id);
  res.status(200).json(userRatings);
});

module.exports = router;
