// --- Dependencies ---
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";   // ✅ Added

dotenv.config();

// --- App setup ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Environment Variables ---
const { MONGO_URI, PORT, JWT_SECRET } = process.env;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("❌ Missing MONGO_URI or JWT_SECRET. Check your .env file.");
  process.exit(1);
}

// --- MongoDB Connection ---
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err?.message || err);
    process.exit(1);
  });

// --- Database Schemas & Models ---
const SessionSchema = new mongoose.Schema({
  otp: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  className: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  attendance: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});
const Session = mongoose.model("Session", SessionSchema);

const NoteSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectName: { type: String, required: true },
  noteContent: { type: String, required: true },
});
const Note = mongoose.model("Note", NoteSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["student", "teacher"] },
  name: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const RoutineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: {
    type: String,
    required: true,
    enum: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ],
  },
  classes: [
    {
      subjectName: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
});
const Routine = mongoose.model("Routine", RoutineSchema);

// --- Auth Middleware ---
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// --- API Routes ---

// Register User
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, role, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role, name });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(400).json({ message: "Error registering user", error });
  }
});

// Login User
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

// Create Session (Teacher only)
app.post("/api/create-session", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const { className } = req.body;
    const otp = crypto.randomBytes(3).toString("hex").toUpperCase();
    const session = new Session({ otp, teacherId: req.user.id, className });
    await session.save();
    res.status(201).json({ message: "Session created", otp });
  } catch (error) {
    res.status(500).json({ message: "Failed to create session", error });
  }
});

// Mark Attendance (Student only)
app.post("/api/mark-attendance", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const { otp } = req.body;
    const session = await Session.findOne({ otp });
    if (!session) return res.status(404).json({ message: "Session not found or expired." });

    const studentId = req.user.id;
    if (session.attendance.some(att => att.studentId.toString() === studentId)) {
      return res.status(409).json({ message: "You have already marked attendance for this session." });
    }

    session.attendance.push({ studentId });
    await session.save();
    res.status(200).json({ message: "Attendance marked successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark attendance", error });
  }
});

// Add Note (Teacher only)
app.post("/api/add-note", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const { subjectName, noteContent } = req.body;
    const note = new Note({ teacherId: req.user.id, subjectName, noteContent });
    await note.save();
    res.status(201).json({ message: "Note added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add note", error });
  }
});

// Add Routine (Teacher only)
app.post("/api/routine", auth, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const { day, classes } = req.body;
    const newRoutine = new Routine({ userId: req.user.id, day, classes });
    await newRoutine.save();
    res.status(201).json({ message: "Routine added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add routine.", error });
  }
});

// Get Notes by Subject
app.get("/api/notes/:subjectName", auth, async (req, res) => {
  try {
    const { subjectName } = req.params;
    const notes = await Note.find({ subjectName });
    if (!notes.length) {
      return res.status(404).json({ message: "No notes found for this subject." });
    }
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes." });
  }
});

// Get Attendance %
app.get("/api/attendance/:userId/:subjectName", auth, async (req, res) => {
  try {
    const { userId, subjectName } = req.params;
    const totalSessions = await Session.countDocuments({ className: subjectName });
    if (totalSessions === 0) {
      return res.status(200).json({ attendancePercentage: 0 });
    }
    const attendedSessions = await Session.countDocuments({
      className: subjectName,
      "attendance.studentId": userId,
    });
    const attendancePercentage = (attendedSessions / totalSessions) * 100;
    res.status(200).json({ attendancePercentage: Math.round(attendancePercentage) });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate attendance." });
  }
});

// Get Today's Routine
app.get("/api/routine/:userId", auth, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const routine = await Routine.findOne({ userId: req.params.userId, day: today });
    if (!routine) {
      return res.status(404).json({ message: "No routine found for today." });
    }
    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch routine." });
  }
});

// Get Teacher's Routine + Notes
app.get("/api/teacher/:teacherId/routine", auth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const routines = await Routine.find({ userId: teacherId });
    const notes = await Note.find({ teacherId });
    res.status(200).json({ routines, notes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teacher data" });
  }
});

// --- Start Server ---
const port = Number(PORT) || 5000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
