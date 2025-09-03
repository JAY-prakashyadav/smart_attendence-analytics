import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import SubjectPage from './SubjectPage';

const App = () => {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <BrowserRouter>
            <div className="bg-gray-100 min-h-screen">
                <header className="bg-white p-4 shadow-md flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Attendance Analytics</h1>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                    >
                        Logout
                    </button>
                </header>
                <main className="p-4">
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/student-dashboard" element={<StudentDashboard />} />
                        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                        <Route path="/subject/:subjectName" element={<SubjectPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
