import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentDashboard() {
  const [routine, setRoutine] = useState(null);

  useEffect(() => {
    const fetchRoutine = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await axios.get(`/api/routine/${userId}`);
        setRoutine(response.data.classes);
      } catch (error) {
        console.error("Failed to fetch routine:", error);
      }
    };
    fetchRoutine();
  }, []);

  if (!routine) return <div>Loading routine...</div>;

  return (
    <div>
      <h1>Student Dashboard</h1>
      <h2>Today's Routine</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {routine.map((cls, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h3>{cls.subjectName}</h3>
            <p>{cls.startTime} - {cls.endTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;
