import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SubjectPage() {
  const { subjectName } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        navigate('/');
        return;
      }

      try {
        // Fetch Notes
        const notesResponse = await axios.get(`${API_URL}/api/notes/${subjectName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(notesResponse.data);

        // Fetch Attendance
        const attendanceResponse = await axios.get(`${API_URL}/api/attendance/${userId}/${subjectName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttendance(attendanceResponse.data.attendancePercentage);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data for this subject.");
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectName, navigate, API_URL]);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{subjectName}</h1>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => alert("Notes functionality will be here!")} 
          style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}
        >
          Notes
        </button>
        <button 
          onClick={() => alert("Mark attendance functionality will be here!")} 
          style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}
        >
          Mark Today's Attendance
        </button>
      </div>

      <div>
        <h2>Attendance</h2>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', maxWidth: '400px' }}>
          <p>Your attendance percentage for this subject is:</p>
          <h3>{attendance !== null ? `${attendance}%` : 'N/A'}</h3>
          <div style={{ backgroundColor: '#e0e0e0', borderRadius: '10px', height: '20px' }}>
            <div 
              style={{ 
                width: `${attendance}%`, 
                height: '100%', 
                backgroundColor: 'green', 
                borderRadius: '10px' 
              }}
            ></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Notes</h2>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div key={index} style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
              <p>{note.noteContent}</p>
              <small>by {note.teacherName}</small>
            </div>
          ))
        ) : (
          <p>No notes available for this subject.</p>
        )}
      </div>
    </div>
  );
}

export default SubjectPage;
