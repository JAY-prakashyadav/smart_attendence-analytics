const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();

// Mark attendance
router.post("/", async (req, res) => {
  try {
    const { studentId, classId, location } = req.body;

    const attendance = new Attendance({
      studentId,
      classId,
      location,
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance list
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

