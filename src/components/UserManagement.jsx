import React, { useEffect, useState } from 'react';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    if (!token) {
      showToast("Authentication required", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 401) {
        showToast("Unauthorized — Please log in again", "error");
      } else if (res.status === 403) {
        showToast("Access denied — Admins only", "error");
      } else {
        showToast("Failed to fetch users", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Toggle upload permission
  const togglePermission = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/grant-upload/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, can_upload: result.can_upload } : user
          )
        );

        showToast(`Upload permission ${result.can_upload ? 'granted' : 'denied'} for ${result.username}`, "success");
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to update permission", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating upload permission", "error");
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (users.length === 0) {
    return <p>No users found</p>;
  }

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        margin: '20px auto'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Username</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Can Upload</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.username}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{user.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>
                <label style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!!user.can_upload}
                    onChange={() => togglePermission(user.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  {user.can_upload ? 'Granted' : 'Denied'}
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;