import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

// Base URL for your backend API (replace with your Render URL)
const API_URL = "http://localhost:5000";

// --- Components ---

const TeacherDashboard = () => {
  const [className, setClassName] = useState('');
  const [teacherId, setTeacherId] = useState('teacher-1'); // Placeholder teacher ID
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState('');
  const [currentOtp, setCurrentOtp] = useState(null);

  useEffect(() => {
    fetchTeacherSessions();
  }, []);

  const fetchTeacherSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/teacher/${teacherId}/sessions`);
      setSessions(response.data);
    } catch (error) {
      setMessage('Failed to fetch sessions.');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setMessage('');
    setCurrentOtp(null);
    try {
      const response = await axios.post(`${API_URL}/api/create-session`, { teacherId, className });
      setMessage(response.data.message);
      setCurrentOtp(response.data.otp);
      fetchTeacherSessions();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating session.');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28F79'];

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Teacher Dashboard</h2>
      
      {message && <div className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4 text-center">{message}</div>}

      {currentOtp && (
        <div className="bg-green-100 text-green-800 p-6 rounded-lg mb-6 text-center shadow-md">
          <p className="text-xl font-semibold mb-2">New Session OTP:</p>
          <p className="text-4xl font-extrabold tracking-widest text-green-700">{currentOtp}</p>
        </div>
      )}

      {/* Create Session Form */}
      <form onSubmit={handleCreateSession} className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Session</h3>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class Name (e.g., Biology 101)"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Generate Session OTP
        </button>
      </form>

      {/* Session List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">My Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-center text-gray-500 italic">No sessions created yet.</p>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">{session.className}</h4>
              <p className="text-sm text-gray-500">OTP: <span className="font-mono font-bold text-gray-700">{session.otp}</span></p>
              <p className="text-sm text-gray-500">Created: {new Date(session.createdAt).toLocaleString()}</p>
              
              <div className="mt-4">
                <h5 className="font-medium text-gray-700">Attendance ({session.attendance.length})</h5>
                {session.attendance.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {session.attendance.map(att => (
                      <span key={att.studentId} className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {att.studentName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-2">No attendance marked yet.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [otp, setOtp] = useState('');
  const [studentId, setStudentId] = useState('student-1'); // Placeholder student ID
  const [studentName, setStudentName] = useState('');
  const [message, setMessage] = useState('');

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/api/mark-attendance`, { otp, studentId, studentName });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error marking attendance.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Student Dashboard</h2>
      
      {message && <div className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4 text-center">{message}</div>}

      <form onSubmit={handleMarkAttendance} className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Mark Your Attendance</h3>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Your Full Name"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Your Student ID"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Session OTP"
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
        >
          Mark Attendance
        </button>
      </form>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white p-4 shadow-md">
          <nav className="flex justify-center space-x-4">
            <Link to="/" className="text-lg font-medium text-gray-600 hover:text-gray-900 transition duration-200">Student</Link>
            <Link to="/teacher" className="text-lg font-medium text-gray-600 hover:text-gray-900 transition duration-200">Teacher</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

