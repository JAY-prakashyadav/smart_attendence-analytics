const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    teacherId: { type: String, required: true },
    noteContent: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
