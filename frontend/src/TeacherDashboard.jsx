import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TeacherDashboard() {
  const [routines, setRoutines] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      const teacherId = localStorage.getItem("userId");
      try {
        const response = await axios.get(`/api/teacher/${teacherId}/routine`);
        setRoutines(response.data.routines || []);
        setNotes(response.data.notes || []);
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
      }
    };
    fetchTeacherData();
  }, []);

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      
      <h2>My Routines</h2>
      {routines.map((routine, i) => (
        <div key={i}>
          <h3>{routine.day}</h3>
          {routine.classes.map((cls, j) => (
            <p key={j}>{cls.subjectName} ({cls.startTime} - {cls.endTime})</p>
          ))}
        </div>
      ))}

      <h2>My Notes</h2>
      {notes.map((note, i) => (
        <div key={i}>
          <h3>{note.subjectName}</h3>
          <p>{note.noteContent}</p>
        </div>
      ))}
    </div>
  );
}

export default TeacherDashboard;
