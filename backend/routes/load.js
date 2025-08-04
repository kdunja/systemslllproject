const express = require("express");
const router = express.Router();

// Kreiranje nove rute (privremeno bez baze)
router.post("/loadassignments", (req, res) => {
  const { userId, title, description, status } = req.body;

  if (!userId || !title || !description) {
    return res.status(400).json({ msg: "Popuni sva obavezna polja." });
  }

  // Test log, umesto upisa u bazu (za sada)
  console.log("Novi tovar:", { userId, title, description, status });

  return res.status(200).json({ msg: "Simulacija: tovar dodat uspešno!" });
});

router.get("/loadassignments", (req, res) => {
  // Simulirani podaci
  const fakeData = [
    {
      loadassignmentId: 1,
      userId: 1,
      title: "Vožnja Beograd - Niš",
      description: "Elektronika u kutijama",
      status: "open"
    },
    {
      loadassignmentId: 2,
      userId: 2,
      title: "Pančevo - Zrenjanin",
      description: "Građevinski materijal",
      status: "in-progress"
    }
  ];

  res.status(200).json(fakeData);
});


module.exports = router;
