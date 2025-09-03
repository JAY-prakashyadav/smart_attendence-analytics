import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import SubjectPage from './SubjectPage';
import RegisterPage from './RegisterPage';

const App = () => {
    return (
        <BrowserRouter>
            <div className="bg-gray-100 min-h-screen">
                <header className="bg-white p-4 shadow-md flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Attendance Analytics</h1>
                    <nav className="flex space-x-4">
                        <Link to="/" className="text-lg font-medium text-gray-600 hover:text-gray-900 transition duration-200">Login</Link>
                        <Link to="/register" className="text-lg font-medium text-gray-600 hover:text-gray-900 transition duration-200">Register</Link>
                    </nav>
                </header>
                <main className="p-4">
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
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
