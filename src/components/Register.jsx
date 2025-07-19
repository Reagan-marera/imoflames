import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Registration successful", "success");
        navigate('/login');
      } else {
        showToast(data.message || 'Registration failed', "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error registering", "error");
    }
  };

  return (
    <div className="container">
      <div className="card auth-card">
        <h2 className="section-title">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;