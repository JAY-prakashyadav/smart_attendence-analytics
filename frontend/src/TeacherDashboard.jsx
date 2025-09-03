import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeacherDashboard() {
  const [routines, setRoutines] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSessionSubject, setNewSessionSubject] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchTeacherData = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/teacher/${userId}/routine`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRoutines(response.data.routines || []);
        setNotes(response.data.notes || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
        setError("Failed to load teacher data. Please try again later.");
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [navigate, API_URL]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/api/create-session`, { subjectName: newSessionSubject }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Session created successfully!");
      setNewSessionSubject('');
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session.");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/api/add-note`, { subjectName: newNoteSubject, noteContent: newNoteContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Note added successfully!");
      setNewNoteSubject('');
      setNewNoteContent('');
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note.");
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teacher Dashboard</h1>

      <div style={{ marginBottom: '30px' }}>
        <h2>Create New Session</h2>
        <form onSubmit={handleCreateSession} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Subject Name" 
            value={newSessionSubject} 
            onChange={(e) => setNewSessionSubject(e.target.value)} 
            required
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button 
            type="submit" 
            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}
          >
            Generate Session
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>My Routines</h2>
        {routines.length > 0 ? (
          routines.map((routine, i) => (
            <div key={i} style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0', borderRadius: '8px' }}>
              <h3>{routine.day}</h3>
              {routine.classes.map((cls, j) => (
                <p key={j}>{cls.subjectName} ({cls.startTime} - {cls.endTime})</p>
              ))}
            </div>
          ))
        ) : (
          <p>No routines found.</p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>My Notes</h2>
        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Subject Name" 
            value={newNoteSubject} 
            onChange={(e) => setNewNoteSubject(e.target.value)} 
            required
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <textarea 
            placeholder="Write your note here..." 
            value={newNoteContent} 
            onChange={(e) => setNewNoteContent(e.target.value)} 
            required
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '100px' }}
          ></textarea>
          <button 
            type="submit" 
            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}
          >
            Add Note
          </button>
        </form>
        {notes.length > 0 ? (
          notes.map((note, i) => (
            <div key={i} style={{ border: '1px solid #eee', padding: '15px', margin: '15px 0', borderRadius: '8px' }}>
              <h3>{note.subjectName}</h3>
              <p>{note.noteContent}</p>
            </div>
          ))
        ) : (
          <p>No notes found.</p>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
