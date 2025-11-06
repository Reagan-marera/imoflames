import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useLocation, useNavigate } from 'react-router-dom';
import { showToast } from './utils';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ProductList.css';

const ProductList = ({ reviews, setReviews, selectedCategory }) => {
  // State
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Hooks
  const location = useLocation();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1024px)' });

  // Categories
  const categories = [
    { name: 'All', color: '#1976d2' },
    { name: 'Phones', color: '#1976d2' },
    { name: 'TVs', color: '#546e7a' },
    { name: 'Laptops', color: '#0288d1' },
    { name: 'Appliances', color: '#1976d2' },
    { name: 'Gaming', color: '#8e24aa' },
    { name: 'Accessories', color: '#2e7d32' },
  ];
  const [filterCategory, setFilterCategory] = useState('All');
  const productsPerPage = isMobile ? 12 : isTablet ? 16 : 20;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch current user: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err.message);
      }
    };
    fetchCurrentUser();
  }, [token]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage);
        queryParams.set('limit', productsPerPage);
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (searchQuery) queryParams.set('search', searchQuery);
        if (filterCategory !== 'All') queryParams.set('category', filterCategory);
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/api/products?${queryParams.toString()}`, { headers });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch products: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        showToast('Failed to load products', 'error');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [location.search, token, selectedCategory, searchQuery, currentPage, productsPerPage, filterCategory]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, filterCategory]);

  const getFilteredProducts = () => {
    try {
      // Ensure products is an array
      if (!Array.isArray(products)) return [];

      const searchLower = searchQuery.toLowerCase();

      // Filter products based on category and search query
      return products.filter((product) => {
        if (!product) return false; // Skip invalid product

        const categoryMatch = filterCategory === 'All' || product.category === filterCategory;
        if (!searchQuery) return categoryMatch; // If no search query, return based on category match

        // Price range filtering
        const priceRangeMatch = searchQuery.match(/^(\d+)-(\d+)$/);
        if (priceRangeMatch) {
          const [min, max] = priceRangeMatch.slice(1).map(Number);
          return categoryMatch && product.price >= min && product.price <= max;
        }

        // Create a list of values to check for partial matches
        const productValues = [
          product.name?.toLowerCase(),
          product.description?.toLowerCase(),
          product.category?.toLowerCase(),
          product.price?.toString().toLowerCase(),
          product.user_id?.toString().toLowerCase(),
          ...(product.extra_images?.map(img => img.toLowerCase()) || []), // Safely map extra images
          ...reviews
            .filter(r => r.productId === product.id)
            .flatMap(r => [
              r.userName?.toLowerCase(),
              r.comment?.toLowerCase(),
              r.rating?.toString().toLowerCase(),
            ]),
        ];

        // Check for exact matches
        const exactMatches = [
          product.user_id?.toString() === searchQuery,
          product.category?.toLowerCase() === searchLower,
        ];

        // Check for partial matches (includes search string)
        const partialMatches = productValues.some(value => value?.includes(searchLower));

        return categoryMatch && (exactMatches.some(Boolean) || partialMatches);
      });
    } catch (err) {
      console.error('Error filtering products:', err);
      return []; // Return empty array on error
    }
  };


  // Handlers
  const handleBuy = async (product) => {
    try {
      if (!token) {
        showToast('You are not logged in', 'error');
        navigate('/login');
        return;
      }
      const phone = prompt('Enter your phone number') || '';
      const email = prompt('Enter your email') || '';
      const location = prompt('Enter your delivery location') || '';
      if (!phone || !email || location) {
        showToast('Phone, Email, and Location are required', 'error');
        return;
      }
      const res = await fetch(`${API_URL}/api/buy/${product.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phone, email, location }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Order placed successfully', 'success');
      } else {
        showToast(data.message || 'Error placing order', 'error');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      showToast('Failed to place order', 'error');
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        showToast('Product deleted successfully', 'success');
        setTotalProducts((prev) => prev - 1);
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Network error. Could not delete product.', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      if (!token) {
        showToast('You need to login first', 'error');
        navigate('/login');
        return;
      }
      const res = await fetch(`${API_URL}/api/cart/add/${product.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Successfully added to cart', 'success');
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const error = await res.json();
        showToast(error.message || 'Could not add to cart', 'error');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast('Network error. Could not add to cart', 'error');
    }
  };

  const handleEditClick = (product) => {
    if (!product) return;
    setEditingProduct(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '',
      category: product.category || '',
    });
    const previews = [];
    if (product.image_path) {
      previews.push(`${API_URL}/api/uploads/${product.image_path}`);
    }
    if (product.extra_images) {
      const extraImages = Array.isArray(product.extra_images)
        ? product.extra_images
        : product.extra_images.split(',');
      previews.push(...extraImages.map((img) => `${API_URL}/api/uploads/${img}`));
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
        const updatedProduct = await res.json();
        setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
        setEditingProduct(null);
        showToast('Product updated successfully', 'success');
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update product', 'error');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      showToast('Failed to update product', 'error');
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditImages(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setEditImagePreviews(previews);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Render
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        }}
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '80px',
            height: '80px',
            border: '8px solid #e0e0e0',
            borderTop: '8px solid #1976d2',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        }}
      >
        <h3 style={{ color: '#d81b60', marginBottom: '20px', fontSize: '24px', fontWeight: 600 }}>Error Loading Products</h3>
        <p style={{ color: '#37474f', marginBottom: '20px', fontSize: '16px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500,
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#1565c0')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        }}
      >
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            borderRadius: '12px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <motion.img
            src="/images/icons/empty-box.png"
            alt="No products"
            width="100"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />
          <motion.h3
            style={{
              marginTop: '20px',
              fontSize: '24px',
              fontWeight: '600',
              color: '#263238'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            No products available yet.
          </motion.h3>
          <motion.p
            style={{
              fontSize: '16px',
              color: '#78909c',
              margin: '10px 0 20px',
              maxWidth: '80%'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Check back later or upload one yourself!
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                marginTop: '15px'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#1565c0')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
            >
              Back Home
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div
      className="product-list-page"
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        padding: '0',
        margin: '0',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        width: '100vw',
        overflowX: 'hidden',
      }}
    >
      {/* Site Description */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          padding: isMobile ? '10px 15px' : '15px 60px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          fontSize: isMobile ? '12px' : '16px',
          color: '#546e7a',
          borderRadius: '0',
          marginBottom: '15px',
          width: '100%',
          boxSizing: 'border-box',
          wordBreak: 'break-word',
          hyphens: 'auto',
        }}
      >
        <p>
          Explore a vibrant marketplace of electronics and appliances. Shop now or list your own products!
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          padding: isMobile ? '10px 15px' : '15px 60px',
          backgroundColor: '#263238',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          borderRadius: '0',
          marginBottom: '15px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      {/* Categories */}
      <motion.div
        className="categories-wrapper"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#fff',
          padding: isMobile ? '8px 15px' : '15px 60px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          width: '100%',
          borderBottom: '1px solid #e0e0e0',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="categories-container"
          style={{
            display: 'flex',
            overflowX: 'auto',
            padding: '0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            gap: isMobile ? '6px' : '12px',
            width: 'max-content',
            minWidth: '100%',
            justifyContent: 'flex-start',
          }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setFilterCategory(category.name)}
              className="category-button"
              style={{
                backgroundColor: filterCategory === category.name ? category.color : '#fff',
                color: filterCategory === category.name ? '#fff' : '#546e7a',
                border: `1px solid ${filterCategory === category.name ? category.color : '#e0e0e0'}`,
                borderRadius: '6px',
                padding: isMobile ? '6px 10px' : '10px 16px',
                fontSize: isMobile ? '11px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: filterCategory === category.name ? `0 2px 5px ${category.color}80` : 'none',
                transition: 'all 0.3s ease',
              }}
              whileHover={{ scale: 1.05, boxShadow: `0 2px 5px ${category.color}80` }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Product Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
        style={{
          padding: isMobile ? '8px 15px' : '15px 60px',
          color: '#546e7a',
          fontSize: isMobile ? '12px' : '14px',
          backgroundColor: '#fff',
          margin: '10px 0',
          borderRadius: '0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: 1, minWidth: '0', wordBreak: 'break-word' }}>
          Showing {filteredProducts.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          {filterCategory !== 'All' && ` in ${filterCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        {totalPages > 1 && (
          <div style={{ fontSize: isMobile ? '12px' : '14px' }}>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </motion.div>

      {/* Product Grid */}
      <div className="product-grid-container">
        <motion.div
          className="product-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product?.id || index}
            className="product-card-wrapper"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(0,0,0,0.15)', transition: { duration: 0.2 } }}
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {product && (
              <>
                <ProductCard
                  product={product}
                  reviews={reviews.filter(r => r.productId === product.id)}
                  onAddToCart={handleAddToCart}
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                  currentUser={currentUser}
                  isMobile={isMobile}
                  jumiaStyle={true}
                  style={{ width: '100%' }}
                />
                <motion.button
                  onClick={() => handleBuy(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '8px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0 0 8px 8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: 'auto',
                    width: '100%',
                  }}
                >
                  Order Now
                </motion.button>
              </>
            )}
          </motion.div>
        ))}
        </motion.div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '4px' : '8px',
            padding: isMobile ? '10px 15px' : '20px 60px',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <motion.button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            style={{
              padding: isMobile ? '6px 8px' : '8px 12px',
              backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1976d2',
              color: currentPage === 1 ? '#78909c' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              minWidth: isMobile ? '30px' : '40px',
              transition: 'all 0.3s ease',
            }}
          >
            First
          </motion.button>
          <motion.button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            style={{
              padding: isMobile ? '6px 8px' : '8px 12px',
              backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1976d2',
              color: currentPage === 1 ? '#78909c' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              minWidth: isMobile ? '30px' : '40px',
              transition: 'all 0.3s ease',
            }}
          >
            Prev
          </motion.button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;
            return (
              <motion.button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: isMobile ? '6px 8px' : '8px 12px',
                  backgroundColor: currentPage === pageNum ? '#1565c0' : '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: isMobile ? '30px' : '40px',
                  transition: 'all 0.3s ease',
                }}
              >
                {pageNum}
              </motion.button>
            );
          })}
          <motion.button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            style={{
              padding: isMobile ? '6px 8px' : '8px 12px',
              backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1976d2',
              color: currentPage === totalPages ? '#78909c' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              minWidth: isMobile ? '30px' : '40px',
              transition: 'all 0.3s ease',
            }}
          >
            Next
          </motion.button>
          <motion.button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            style={{
              padding: isMobile ? '6px 8px' : '8px 12px',
              backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1976d2',
              color: currentPage === totalPages ? '#78909c' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              minWidth: isMobile ? '30px' : '40px',
              transition: 'all 0.3s ease',
            }}
          >
            Last
          </motion.button>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            color: '#546e7a',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#fff',
            margin: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <motion.img
            src="/images/icons/search-empty.png"
            alt="No results"
            width="120"
            animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h3 style={{ marginTop: '20px', fontSize: '20px', color: '#263238', fontWeight: 600 }}>No products found</h3>
          <p style={{ fontSize: '14px', color: '#78909c', maxWidth: '500px', marginTop: '10px' }}>
            {`We couldn't find any products matching your ${searchQuery ? 'search' : 'category'} criteria. Try adjusting your filters.`}
          </p>
          <motion.button
            onClick={() => {
              setFilterCategory('All');
              setSearchQuery('');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1565c0')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
          >
            Reset Filters
          </motion.button>
        </motion.div>
      )}

    </div>
  );
};

export default ProductList;
