import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post(`${API_URL}/api/register`, { username, password, role, name });
            setMessage('Registration successful! You can now log in.');
            // Optionally, you could automatically log in the user here
            // or redirect them to the login page.
            // navigate('/'); 
        } catch (error) {
            setMessage('Registration failed. Username may already exist.');
            console.error('Registration failed:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h1 style={{ textAlign: 'center' }}>Register</h1>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Username (e.g., Roll no. / Emp. ID)" 
                    required 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                    required 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your Full Name" 
                    required 
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
                <button 
                    type="submit"
                    style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Register
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', textAlign: 'center', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
}

export default RegisterPage;
