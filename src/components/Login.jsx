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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '1.5rem', color: '#263238', fontSize: '24px', fontWeight: '600' }}>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link
              to="/forgot-password"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            Sign In
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', fontSize: '14px', color: '#666' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontWeight: '500',
              marginLeft: '4px'
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
