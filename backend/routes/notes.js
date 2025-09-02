const express = require("express");
const Note = require("../models/Note"); // You'll need to create this model

const router = express.Router();

// --- New API Route to get routine and notes for a teacher ---
router.get("/:teacherId/routine", async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        // This is where you would get the routine data from your database.
        // For now, we'll use a hardcoded example.
        const routine = [
            { subjectName: "Mathematics", time: "9:00 AM - 10:00 AM" },
            { subjectName: "Physics", time: "10:00 AM - 11:00 AM" }
        ];

        // This is where you would get the notes from your database.
        const notes = await Note.find({ teacherId: teacherId, subjectName: "Mathematics" });
        
        res.status(200).json({ routine, notes });

    } catch (error) {
        console.error("Error fetching routine:", error);
        res.status(500).json({ message: "Failed to fetch routine" });
    }
});

// --- New API Route to add a new note ---
router.post("/", async (req, res) => {
    try {
        const { subjectName, teacherId, noteContent } = req.body;
        
        const newNote = new Note({ subjectName, teacherId, noteContent });
        await newNote.save();
        
        res.status(201).json({ message: "Note added successfully" });
        
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ message: "Failed to add note" });
    }
});

module.exports = router;
