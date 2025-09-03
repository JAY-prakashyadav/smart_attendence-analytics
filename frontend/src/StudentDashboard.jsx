import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentDashboard() {
  const [routine, setRoutine] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchRoutine = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        navigate('/');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/routine/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRoutine(response.data.classes);
      } catch (error) {
        console.error("Failed to fetch routine:", error);
        setError("Failed to fetch routine. Please try again later.");
        setRoutine([]); // Set to empty array to show "No routine" message
      }
    };
    fetchRoutine();
  }, [navigate]);

  const handleSubjectClick = (subjectName) => {
    navigate(`/subject/${subjectName}`);
  };

  if (!routine) return <div>Loading routine...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Student Dashboard</h1>
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      <h2>Today's Routine</h2>
      {routine.length === 0 ? (
        <p>No routine found for today.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {routine.map((cls, index) => (
            <div 
              key={index} 
              onClick={() => handleSubjectClick(cls.subjectName)}
              style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                borderRadius: '8px', 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h3>{cls.subjectName}</h3>
              <p>{cls.startTime} - {cls.endTime}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
