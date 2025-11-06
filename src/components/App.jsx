import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Home';
import Login from './Login';
import Register from './Register';
import ProductForm from './ProductForm';
import PaymentForm from './PaymentForm';
import Navbar from './Navbar';
import AdminDashboard from './AdminDashboard';
import NotFound from './NotFound';
import CartPage from './CartPage';
import ContactUsForm from './Contact Us';
import './App.css';
import './global.css';
import UserManagement from './UserManagement';
import ProductList from './ProductList';
import ForgotPassword from './ForgotPassword';
import ProductDetails from './ProductDetails';

function App() {
  return (
    <Router>
      <>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact-us" element={<ContactUsForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/upload" element={<ProductForm />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </>
    </Router>
  );
}

export default App;
