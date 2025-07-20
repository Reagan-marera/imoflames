import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useLocation, useNavigate } from 'react-router-dom';
import { showToast } from './utils';
import ProductCard from './ProductCard';

const ProductList = ({ selectedCategory }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const location = useLocation();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to fetch current user:', res.status, errorText);
          return;
        }
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    fetchCurrentUser();
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      let url = `${API_URL}/api/products`;
      if (location.search) url += location.search;
      if (selectedCategory) url += `?category=${selectedCategory}`;

      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : {}
          }
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to fetch products:', res.status, errorText);
          showToast("Failed to load products", "error");
          return;
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        showToast("Failed to load products", "error");
      }
    };

    fetchProducts();
  }, [location.search, token, selectedCategory]);

  const handleBuy = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast("You are not logged in", "error");
        return;
      }

      const phone = prompt("Enter your phone number") || '';
      const email = prompt("Enter your email") || '';
      const location = prompt("Enter your delivery location") || '';

      if (!phone || !email || !location) {
        showToast("Phone, Email, and Location are required", "error");
        return;
      }

      const res = await fetch(`${API_URL}/api/buy/${product.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone_number: phone, email, location })
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Order placed successfully", "success");
        fetchMyProducts(currentUser?.id);
      } else {
        showToast(data.message || "Error placing order", "error");
      }
    } catch (err) {
      console.error('Error placing order:', err);
      showToast("Failed to place order", "error");
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
        showToast("Product deleted successfully", "success");
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to delete product", "error");
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast("Network error. Could not delete product.", "error");
    }
  };

  const fetchMyProducts = async (userId) => {
    if (!userId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // You can update cart count here using Context or state management
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/add/${product.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast("Added to cart", "success");
      } else {
        const error = await res.json();
        showToast(error.message || "Could not add to cart", "error");
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast("Network error. Could not add to cart", "error");
    }
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setShowDetailsModal(true);
  };

  const closeProductDetails = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => {
      const totalImages = selectedProduct.extra_images ? selectedProduct.extra_images.length + 1 : 1;
      return (prev + 1) % totalImages;
    });
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => {
      const totalImages = selectedProduct.extra_images ? selectedProduct.extra_images.length + 1 : 1;
      return (prev - 1 + totalImages) % totalImages;
    });
  };

  const getCurrentImage = () => {
    if (!selectedProduct) return '';
    if (currentImageIndex === 0) return `${API_URL}/api/uploads/${selectedProduct.image_path}`;
    return `${API_URL}/api/uploads/${selectedProduct.extra_images[currentImageIndex - 1]}`;
  };

  if (products.length === 0) {
    return (
      <div className="empty-products-container">
        <img src="/images/icons/empty-box.png" alt="No products" width="100" />
        <h3>No products available yet.</h3>
        <p>Check back later or upload one yourself!</p>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={openProductDetails}
          onBuy={handleBuy}
          onAddToCart={handleAddToCart}
          onDelete={handleDelete}
          currentUser={currentUser}
        />
      ))}

      {showDetailsModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeProductDetails} className="modal-close-btn">
              ×
            </button>
            <div className="modal-body">
              <div className="modal-image-gallery">
                <div className="modal-main-image-container">
                  <img
                    src={getCurrentImage()}
                    alt={selectedProduct.name}
                    className="modal-main-image"
                  />
                  <button onClick={prevImage} className="modal-nav-btn prev">
                    ❮
                  </button>
                  <button onClick={nextImage} className="modal-nav-btn next">
                    ❯
                  </button>
                </div>
                <div className="modal-thumbnail-container">
                  <div
                    onClick={() => setCurrentImageIndex(0)}
                    className={`modal-thumbnail ${currentImageIndex === 0 ? 'active' : ''}`}
                  >
                    <img
                      src={`${API_URL}/api/uploads/${selectedProduct.image_path}`}
                      alt="Thumbnail"
                    />
                  </div>
                  {selectedProduct.extra_images && selectedProduct.extra_images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentImageIndex(index + 1)}
                      className={`modal-thumbnail ${currentImageIndex === index + 1 ? 'active' : ''}`}
                    >
                      <img
                        src={`${API_URL}/api/uploads/${img}`}
                        alt={`Thumbnail ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-product-details">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-price">
                  KES {selectedProduct.price.toLocaleString()}
                </p>
                <div className="modal-description">
                  <h3>Description</h3>
                  <p>{selectedProduct.description}</p>
                </div>
                <div className="modal-meta">
                  <div>
                    <p className="meta-label">Category</p>
                    <p className="meta-value">{selectedProduct.category || 'N/A'}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    onClick={() => handleBuy(selectedProduct)}
                    className="btn btn-primary"
                  >
                    Order Now
                  </button>
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="btn btn-secondary"
                  >
                    Add to Cart
                  </button>
                </div>
                {currentUser && (currentUser.is_admin || selectedProduct.user_id === currentUser.id) && (
                  <div className="modal-admin-actions">
                    <h3>Admin Actions</h3>
                    <button
                      onClick={() => handleDelete(selectedProduct.id)}
                      className="btn btn-danger"
                    >
                      Delete Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;