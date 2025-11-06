import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Server response format error");
      }

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast("Login successful! Welcome back!", "success");
        navigate('/');
      } else {
        // Handle specific error codes with user-friendly messages
        if (res.status === 401) {
          showToast("Invalid username or password. Please try again.", "error");
        } else if (res.status === 403) {
          showToast("Account temporarily locked. Please contact support.", "error");
        } else if (res.status === 404) {
          showToast("User not found. Please check your credentials.", "error");
        } else if (res.status === 429) {
          showToast("Too many login attempts. Please try again later.", "error");
        } else {
          showToast(data.message || 'Login failed. Please try again.', "error");
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        showToast("Network error. Please check your connection and try again.", "error");
      } else if (err.message.includes('Server response format error')) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast("An unexpected error occurred. Please try again.", "error");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
