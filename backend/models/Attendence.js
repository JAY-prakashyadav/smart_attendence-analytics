const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  classId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);

