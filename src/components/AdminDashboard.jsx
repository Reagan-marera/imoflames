// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        navigate('/login');
      }
    };
    fetchProducts();
  }, [token, navigate]); // ✅ Added missing deps here

  const handleApprove = async (id) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      const updated = products.map(p =>
        p.id === id ? { ...p, is_approved: true } : p
      );
      setProducts(updated);
    }
  };

  return (
    <div>
      <h2>Admin Dashboard - Manage Products</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>KES {product.price.toFixed(2)}</td>
              <td>{product.is_approved ? 'Approved' : 'Pending'}</td>
              <td>
                {!product.is_approved && (
                  <button onClick={() => handleApprove(product.id)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;