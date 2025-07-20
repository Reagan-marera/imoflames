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

  const [filterCategory, setFilterCategory] = useState('All');
  const categories = ['All', 'Phones', 'TVs', 'Laptops', 'Heaters', 'Gaming Consoles', 'Accessories'];

  const filteredProducts = products.filter(product => {
    if (filterCategory === 'All') {
      return true;
    }
    return product.category === filterCategory;
  });

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
    <div>
      <div className="filter-container" style={{ marginBottom: '2rem' }}>
        <label htmlFor="category-select">Filter by Category:</label>
        <select
          id="category-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="product-list-container">
        {filteredProducts.map(product => (
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
      </div>

      {showDetailsModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '900px',
            padding: '20px',
            position: 'relative'
          }}>
            <button
              onClick={closeProductDetails}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#7f8c8d'
              }}
            >
              ×
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '20px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <img
                      src={getCurrentImage()}
                      alt={selectedProduct.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        padding: '15px',
                        cursor: 'pointer',
                        zIndex: 1,
                        borderRadius: '50%'
                      }}
                    >
                      ❮
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: 'none',
                        padding: '15px',
                        cursor: 'pointer',
                        zIndex: 1,
                        borderRadius: '50%'
                      }}
                    >
                      ❯
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    padding: '10px 0'
                  }}>
                    <div
                      onClick={() => setCurrentImageIndex(0)}
                      style={{
                        minWidth: '80px',
                        height: '80px',
                        border: currentImageIndex === 0 ? '2px solid #3498db' : '1px solid #ddd',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={`${API_URL}/api/uploads/${selectedProduct.image_path}`}
                        alt="Thumbnail"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    {selectedProduct.extra_images && selectedProduct.extra_images.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => setCurrentImageIndex(index + 1)}
                        style={{
                          minWidth: '80px',
                          height: '80px',
                          border: currentImageIndex === index + 1 ? '2px solid #3498db' : '1px solid #ddd',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                      >
                        <img
                          src={`${API_URL}/api/uploads/${img}`}
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{
                    color: '#2c3e50',
                    marginBottom: '10px',
                    fontSize: '28px'
                  }}>
                    {selectedProduct.name}
                  </h2>

                  <p style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#e67e22',
                    marginBottom: '20px'
                  }}>
                    KES {selectedProduct.price.toLocaleString()}
                  </p>

                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      marginBottom: '10px',
                      color: '#2c3e50',
                      fontSize: '18px'
                    }}>
                      Description
                    </h3>
                    <p style={{ lineHeight: '1.6' }}>
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px 15px',
                      borderRadius: '5px',
                      flex: '1 1 200px'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#7f8c8d',
                        marginBottom: '5px'
                      }}>
                        Category
                      </p>
                      <p style={{ fontWeight: 'bold' }}>
                        {selectedProduct.category || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginTop: '20px'
                  }}>
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
                </div>
              </div>

              {currentUser && (currentUser.is_admin || selectedProduct.user_id === currentUser.id) && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <h3 style={{
                    marginBottom: '10px',
                    color: '#2c3e50',
                    fontSize: '18px'
                  }}>
                    Admin Actions
                  </h3>
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
      )}
    </div>
  );
};

export default ProductList;