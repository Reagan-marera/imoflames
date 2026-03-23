// Shop.js - Add edit/delete functionality
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar, FaShoppingCart, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [floatingElements, setFloatingElements] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const productsPerPage = 12;

  // Create floating animation elements
  useEffect(() => {
    const elements = ['🛍️', '🛒', '📦', '💎', '✨', '🎁', '🏷️', '⭐', '💫', '🌟'];
    const newFloatingElements = [];
    for (let i = 0; i < 12; i++) {
      newFloatingElements.push({
        id: i,
        icon: elements[Math.floor(Math.random() * elements.length)],
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 20,
        animationDelay: Math.random() * 10,
        size: 20 + Math.random() * 30,
        opacity: 0.1 + Math.random() * 0.2
      });
    }
    setFloatingElements(newFloatingElements);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCurrentUser();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set('page', currentPage);
      queryParams.set('limit', productsPerPage);
      if (selectedCategory !== 'All') {
        queryParams.set('category', selectedCategory);
      }
      
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      
      const res = await fetch(`${API_URL}/api/products?${queryParams.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const productsArray = Array.isArray(data.products) ? data.products : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        setTotalPages(data.totalPages || 1);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(productsArray.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = Array.isArray(products) ? [...products] : [];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const addToCart = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      showToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/cart/add/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        showToast('Product added to cart!', 'success');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    const confirmDelete = window.confirm('Are you sure you want to delete this product? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        showToast('Product deleted successfully!', 'success');
        // Refresh products list
        fetchProducts();
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const handleEditProduct = (e, product) => {
    e.stopPropagation();
    setEditingProduct(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      category: product.category || '',
    });
    
    const previews = [];
    if (product.image_path) {
      previews.push(`${API_URL}/uploads/${product.image_path.replace(/^\/+/, '')}`);
    }
    if (product.extra_images) {
      const extraImages = Array.isArray(product.extra_images) 
        ? product.extra_images 
        : product.extra_images.split(',');
      previews.push(...extraImages.map(img => `${API_URL}/uploads/${img.replace(/^\/+/, '')}`));
    }
    setEditImagePreviews(previews);
    setEditImages([]);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.price) {
      showToast('Name and price are required', 'error');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('description', editFormData.description);
      formData.append('price', editFormData.price);
      formData.append('category', editFormData.category);
      editImages.forEach((file) => {
        formData.append('images', file);
      });
      
      const res = await fetch(`${API_URL}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (res.ok) {
        showToast('Product updated successfully!', 'success');
        setEditingProduct(null);
        fetchProducts(); // Refresh products
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Failed to update product', 'error');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canEditDelete = (product) => {
    if (!currentUser) return false;
    return currentUser.is_admin || product.user_id === currentUser.id;
  };

  const hasProducts = Array.isArray(filteredProducts) && filteredProducts.length > 0;

  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.backgroundElements}>
        {floatingElements.map((element) => (
          <div
            key={element.id}
            style={{
              ...styles.floatingElement,
              left: `${element.left}%`,
              fontSize: `${element.size}px`,
              opacity: element.opacity,
              animation: `float${(element.id % 5) + 1} ${element.animationDuration}s infinite linear`,
              animationDelay: `${element.animationDelay}s`
            }}
          >
            {element.icon}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.heroContent}
          >
            <h1 style={styles.heroTitle}>Shop Our Collection</h1>
            <p style={styles.heroSubtitle}>Discover amazing products at unbeatable prices</p>
          </motion.div>
        </div>

        {/* Search and Filter Section */}
        <div style={styles.filterSection}>
          <div style={styles.searchBar}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
                <FaTimes />
              </button>
            )}
          </div>
          
          <div style={styles.categoryFilter}>
            <FaFilter style={styles.filterIcon} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.categorySelect}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Count */}
        <div style={styles.productCount}>
          <span>{filteredProducts.length} products found</span>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Loading products...</p>
          </div>
        ) : !hasProducts ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>🛍️</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              style={styles.resetButton}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div style={styles.productsGrid}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  style={styles.productCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div style={styles.productImageContainer}>
                    <img
                      src={product.image_path ? `${API_URL}/uploads/${product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    {canEditDelete(product) && (
                      <div style={styles.productActions}>
                        <button
                          onClick={(e) => handleEditProduct(e, product)}
                          style={styles.editButton}
                          title="Edit Product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => handleDeleteProduct(e, product.id)}
                          style={styles.deleteButton}
                          title="Delete Product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productCategory}>{product.category || 'Uncategorized'}</p>
                    <div style={styles.productRating}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ color: '#ffc107', fontSize: '12px' }} />
                      ))}
                    </div>
                    <div style={styles.productFooter}>
                      <p style={styles.productPrice}>
                        KES {product.price ? product.price.toLocaleString() : '0'}
                      </p>
                      <button
                        onClick={(e) => addToCart(e, product.id)}
                        style={styles.addToCartButton}
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ ...styles.pageButton, ...(currentPage === 1 ? styles.disabledButton : {}) }}
                >
                  Previous
                </button>
                <div style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          ...styles.pageNumber,
                          ...(currentPage === pageNum ? styles.activePage : {})
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ ...styles.pageButton, ...(currentPage === totalPages ? styles.disabledButton : {}) }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setEditingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} style={styles.closeButton}>✕</button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div style={styles.formGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    required
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows="4"
                    style={styles.formTextarea}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                    required
                    step="0.01"
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Update Images (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setEditImages(files);
                      const previews = files.map(file => URL.createObjectURL(file));
                      setEditImagePreviews(previews);
                    }}
                    style={styles.fileInput}
                  />
                  {editImagePreviews.length > 0 && (
                    <div style={styles.imagePreviewContainer}>
                      {editImagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt="Preview" style={styles.imagePreview} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.saveButton}>Save Changes</button>
                  <button type="button" onClick={() => setEditingProduct(null)} style={styles.cancelButton}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  floatingElement: {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none'
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 20px 40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  hero: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  heroContent: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px'
  },
  heroSubtitle: {
    fontSize: '14px',
    color: '#666'
  },
  filterSection: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  searchBar: {
    flex: 1,
    position: 'relative',
    maxWidth: '400px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '14px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 35px 10px 38px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  clearButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '12px'
  },
  categoryFilter: {
    position: 'relative',
    minWidth: '160px'
  },
  filterIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '14px',
    zIndex: 1
  },
  categorySelect: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  productCount: {
    textAlign: 'center',
    marginBottom: '20px',
    padding: '8px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#666'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative'
  },
  productImageContainer: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  productActions: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    gap: '8px',
    zIndex: 2
  },
  editButton: {
    background: 'rgba(102, 126, 234, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteButton: {
    background: 'rgba(220, 53, 69, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  productInfo: {
    padding: '12px'
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '5px',
    color: '#333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  productCategory: {
    fontSize: '11px',
    color: '#999',
    marginBottom: '8px'
  },
  productRating: {
    display: 'flex',
    gap: '3px',
    marginBottom: '10px'
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productPrice: {
    fontSize: '16px',
    color: '#667eea',
    fontWeight: 'bold'
  },
  addToCartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    width: '32px',
    height: '32px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px'
  },
  pageButton: {
    padding: '8px 16px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    fontSize: '13px'
  },
  pageNumbers: {
    display: 'flex',
    gap: '6px'
  },
  pageNumber: {
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    fontSize: '13px'
  },
  activePage: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: 'transparent'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '15px'
  },
  loadingSpinner: {
    fontSize: '30px',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '15px'
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '15px'
  },
  resetButton: {
    marginTop: '15px',
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    fontSize: '13px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '30px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  formTextarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    resize: 'vertical'
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px'
  },
  imagePreviewContainer: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  imagePreview: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  adminActions: {
  display: 'flex',
  gap: '12px',
  marginTop: '15px',
  paddingTop: '15px',
  borderTop: '1px solid #e0e0e0'
},
editButton: {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
},
deleteButton: {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px',
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
},
  cancelButton: {
    flex: 1,
    padding: '10px',
    background: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

export default Shop;