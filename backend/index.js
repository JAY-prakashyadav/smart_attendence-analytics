import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => res.send("API is running!"));

// --- MongoDB connection ---
const { MONGO_URI, PORT } = process.env;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set. Add it to .env (local) or Render env vars.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err?.message || err);
    process.exit(1);
  });

// --- Schema / Model ---
const SessionSchema = new mongoose.Schema({
  otp: { type: String, required: true, unique: true },
  teacherId: { type: String, required: true },
  className: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  attendance: [
    {
      studentId: String,
      studentName: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Session = mongoose.model("Session", SessionSchema);

// Utility: generate unique OTP (handles rare duplicate collisions)
async function createUniqueOtp() {
  for (let i = 0; i < 5; i++) {
    const otp = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
    const exists = await Session.exists({ otp });
    if (!exists) return otp;
  }
  // Extremely unlikely, but fallback to longer OTP
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// --- Routes ---
// Create session
app.post("/api/create-session", async (req, res) => {
  try {
    const { teacherId, className } = req.body;
    if (!teacherId || !className) {
      return res.status(400).json({ message: "teacherId and className are required." });
    }

    const otp = await createUniqueOtp();
    const newSession = new Session({ otp, teacherId, className });
    await newSession.save();

    res.status(201).json({ message: "Session created successfully", otp });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Failed to create session" });
  }
});

// Mark attendance
app.post("/api/mark-attendance", async (req, res) => {
  try {
    const { otp, studentId, studentName } = req.body;
    if (!otp || !studentId || !studentName) {
      return res.status(400).json({ message: "otp, studentId, studentName are required." });
    }

    const session = await Session.findOne({ otp });
    if (!session) {
      return res.status(404).json({ message: "Invalid or expired OTP." });
    }

    const already = session.attendance.some((a) => a.studentId === studentId);
    if (already) {
      return res
        .status(409)
        .json({ message: "You have already marked attendance for this session." });
    }

    session.attendance.push({ studentId, studentName });
    await session.save();

    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
});

// Get a session by OTP
app.get("/api/sessions/:otp", async (req, res) => {
  try {
    const session = await Session.findOne({ otp: req.params.otp });
    if (!session) return res.status(404).json({ message: "Session not found." });
    res.status(200).json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

// Get all sessions for a teacher
app.get("/api/teacher/:teacherId/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching teacher sessions:", error);
    res.status(500).json({ message: "Failed to fetch teacher sessions" });
  }
});

// Start server
const port = Number(PORT) || 5000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
