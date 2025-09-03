// --- Dependencies ---
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// --- App setup ---
const app = express();
app.use(bodyParser.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// --- Database Schemas & Models ---

// Session Schema
const SessionSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  studentsPresent: [String], // roll numbers of students
});
const Session = mongoose.model("Session", SessionSchema);

// Note Schema
const NoteSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subjectName: { type: String, required: true },
  noteContent: { type: String, required: true },
});
const Note = mongoose.model("Note", NoteSchema);

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // roll no. or emp ID
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["student", "teacher"] },
  name: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// Routine Schema
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
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

// Create Session (Protected)
app.post("/api/create-session", auth, async (req, res) => {
  try {
    const { subjectName } = req.body;
    const session = new Session({ subjectName, studentsPresent: [] });
    await session.save();
    res.status(201).json({ message: "Session created", sessionId: session._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to create session", error });
  }
});

// Mark Attendance (Protected)
app.post("/api/mark-attendance/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rollNumber } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (!session.studentsPresent.includes(rollNumber)) {
      session.studentsPresent.push(rollNumber);
      await session.save();
    }

    res.status(200).json({ message: "Attendance marked" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark attendance", error });
  }
});

// Add Note (Protected)
app.post("/api/add-note", auth, async (req, res) => {
  try {
    const { subjectName, noteContent } = req.body;
    const note = new Note({ teacherId: req.user.id, subjectName, noteContent });
    await note.save();
    res.status(201).json({ message: "Note added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add note", error });
  }
});

// Add a routine for a user (teacher)
app.post("/api/routine", auth, async (req, res) => {
  try {
    const { day, classes } = req.body;
    const newRoutine = new Routine({ userId: req.user.id, day, classes });
    await newRoutine.save();
    res.status(201).json({ message: "Routine added successfully." });
  } catch (error) {
    console.error("Error adding routine:", error);
    res.status(500).json({ message: "Failed to add routine." });
  }
});

// Get today's routine for a user
app.get("/api/routine/:userId", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const routine = await Routine.findOne({ userId: req.params.userId, day: today });
    if (!routine) {
      return res.status(404).json({ message: "No routine found for today." });
    }
    res.status(200).json(routine);
  } catch (error) {
    console.error("Error fetching routine:", error);
    res.status(500).json({ message: "Failed to fetch routine." });
  }
});

// Get Routine + Notes for Teacher
app.get("/api/teacher/:teacherId/routine", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findOne({ username: teacherId, role: "teacher" });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const routines = await Routine.find({ userId: teacher._id });
    const notes = await Note.find({ teacherId: teacher._id });

    res.status(200).json({ routines, notes });
  } catch (error) {
    console.error("Error fetching routine:", error);
    res.status(500).json({ message: "Failed to fetch routine" });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
