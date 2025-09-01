import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send("API is running!");
});

// MongoDB connection
mongoose.connect(" mongodb+srv://spyaduvansi423_db_user:F3hA2zOHhfJuc14V@smart-attendance.ybnduim.mongodb.net/?retryWrites=true&w=majority&appName=smart-attendance")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// --- Database Schema ---
const SessionSchema = new mongoose.Schema({
    otp: { type: String, required: true, unique: true },
    teacherId: { type: String, required: true },
    className: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    attendance: [{
        studentId: String,
        studentName: String,
        timestamp: { type: Date, default: Date.now }
    }]
});
const Session = mongoose.model("Session", SessionSchema);

// --- API Routes ---

// Route 1: Create a new session (for teachers)
app.post("/api/create-session", async (req, res) => {
    try {
        const { teacherId, className } = req.body;
        // Generate a 6-digit OTP
        const otp = crypto.randomBytes(3).toString('hex').toUpperCase();

        const newSession = new Session({
            otp,
            teacherId,
            className
        });
        await newSession.save();
        res.status(201).json({ message: "Session created successfully", otp });
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Failed to create session" });
    }
});

// Route 2: Mark attendance (for students)
app.post("/api/mark-attendance", async (req, res) => {
    try {
        const { otp, studentId, studentName } = req.body;
        const session = await Session.findOne({ otp });

        if (!session) {
            return res.status(404).json({ message: "Invalid or expired OTP." });
        }

        // Check if student has already marked attendance
        const existingAttendance = session.attendance.some(att => att.studentId === studentId);
        if (existingAttendance) {
            return res.status(409).json({ message: "You have already marked attendance for this session." });
        }

        // Add the student to the session's attendance list
        session.attendance.push({ studentId, studentName });
        await session.save();

        res.status(200).json({ message: "Attendance marked successfully." });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Failed to mark attendance" });
    }
});

// Route 3: Get attendance data for a session
app.get("/api/sessions/:otp", async (req, res) => {
    try {
        const session = await Session.findOne({ otp: req.params.otp });
        if (!session) {
            return res.status(404).json({ message: "Session not found." });
        }
        res.status(200).json(session);
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(500).json({ message: "Failed to fetch session" });
    }
});

// Route 4: Get all sessions for a teacher
app.get("/api/teacher/:teacherId/sessions", async (req, res) => {
    try {
        const sessions = await Session.find({ teacherId: req.params.teacherId });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching teacher sessions:", error);
        res.status(500).json({ message: "Failed to fetch teacher sessions" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
