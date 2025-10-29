import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { showToast } from './utils';
import ProductCard from './ProductCard';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

// Categories data
const categories = [
  { name: 'All', color: '#1976d2' },
  { name: 'Phones', color: '#1976d2' },
  { name: 'TVs', color: '#546e7a' },
  { name: 'Computers', color: '#ff9800' },
  { name: 'Tablets', color: '#ff9800' },
  { name: 'Softwares', color: '#009688' },
  { name: 'Laptops', color: '#0288d1' },
  { name: 'Appliances', color: '#1976d2' },
  { name: 'Gaming', color: '#8e24aa' },
  { name: 'Accessories', color: '#2e7d32' },
  { name: 'Gaming Consoles', color: '#6a1b9a' },
  { name: 'Workstations', color: '#455a64' },
];

// SearchBar Component
const SearchBar = ({ searchQuery, onSearch, isMobile }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    style={{
      padding: 0,
      margin: '1px 0',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    }}
  >
    <form
      onSubmit={onSearch}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <input
        type="text"
        name="search"
        placeholder="Search products..."
        defaultValue={searchQuery}
        style={{
          flex: 1,
          padding: isMobile ? '4px 8px' : '6px 10px',
          borderRadius: '4px',
          border: '1px solid #FFD700',
          fontSize: isMobile ? '14px' : '16px',
          outline: 'none',
          backgroundColor: '#333',
          color: '#fff',
        }}
      />
      <button
        type="submit"
        style={{
          padding: isMobile ? '4px 8px' : '6px 10px',
          backgroundColor: '#FFD700',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FiSearch size={isMobile ? 16 : 18} />
      </button>
    </form>
  </motion.div>
);

// FeaturedCarousel Component
const FeaturedCarousel = ({ products, isMobile }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [];
  for (let i = 0; i < products.length; i += 2) {
    slides.push(products.slice(i, i + 2));
  }

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <motion.div
      style={{
        position: 'relative',
        height: isMobile ? '150px' : '180px',
        overflow: 'hidden',
        marginBottom: '8px',
        backgroundColor: '#000',
        borderRadius: '0',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: '8px',
            backgroundColor: '#000',
            padding: '0 15px',
          }}
        >
          {slides[currentSlide].map((product, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                maxWidth: '48%',
                textAlign: 'center',
                color: '#fff',
                padding: '4px',
              }}
            >
              <img
                src={`${API_URL}/api/uploads/${product.image_path}`}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: isMobile ? '80px' : '110px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  border: '1px solid #FFD700',
                }}
              />
              <h4
                style={{
                  margin: '0 0 3px 0',
                  fontSize: isMobile ? '11px' : '13px',
                  fontWeight: '600',
                }}
              >
                {product.name}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '14px',
                  color: '#FFD700',
                }}
              >
                KES {product.price.toLocaleString()}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: isMobile ? '9px' : '11px',
                  color: '#aaa',
                }}
              >
                {product.category}
              </p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '3px',
        }}
      >
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: currentSlide === index ? '#FFD700' : '#555',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Main ProductList Component
const ProductList = ({ selectedCategory }) => {
  // State
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  const [filterCategory, setFilterCategory] = useState('All');
  const [carouselProducts, setCarouselProducts] = useState([]);

  // Hooks
  const location = useLocation();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1024px)' });
  const productsPerPage = isMobile ? 20 : 30;

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
    hidden: { opacity: 0, y: 0 },
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

  // Shuffle and set carousel products
  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setCarouselProducts(shuffled);
    }
  }, [products]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, filterCategory]);

  // Filter products
  const getFilteredProducts = () => {
    try {
      if (!Array.isArray(products)) return [];
      const searchLower = searchQuery.toLowerCase();
      return products.filter((product) => {
        if (!product) return false;
        const categoryMatch = filterCategory === 'All' || product.category === filterCategory;
        if (!searchQuery) return categoryMatch;
        const productValues = [
          product.name?.toLowerCase(),
          product.description?.toLowerCase(),
          product.category?.toLowerCase(),
          product.price?.toString().toLowerCase(),
          product.user_id?.toString().toLowerCase(),
          ...(product.extra_images?.map((img) => img.toLowerCase()) || []),
        ];
        return categoryMatch && productValues.some((value) => value?.includes(searchLower));
      });
    } catch (err) {
      console.error('Error filtering products:', err);
      return [];
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
      if (!phone || !email || !location) {
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
    if (!selectedProduct) return;
    setCurrentImageIndex((prev) => {
      const totalImages = selectedProduct.extra_images ? selectedProduct.extra_images.length + 1 : 1;
      return (prev + 1) % totalImages;
    });
  };

  const prevImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex((prev) => {
      const totalImages = selectedProduct.extra_images ? selectedProduct.extra_images.length + 1 : 1;
      return (prev - 1 + totalImages) % totalImages;
    });
  };

  const getCurrentImage = () => {
    if (!selectedProduct) return '';
    if (currentImageIndex === 0) return `${API_URL}/api/uploads/${selectedProduct.image_path}`;
    if (selectedProduct.extra_images && selectedProduct.extra_images[currentImageIndex - 1]) {
      return `${API_URL}/api/uploads/${selectedProduct.extra_images[currentImageIndex - 1]}`;
    }
    return '';
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
      const extraImages = Array.isArray(product.extra_images) ? product.extra_images : product.extra_images.split(',');
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
        if (selectedProduct?.id === updatedProduct.id) {
          setSelectedProduct(updatedProduct);
        }
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

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.search.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Grid layout: Responsive columns
  const gridColumns = isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)';
  const gridGap = isMobile ? '4px' : '6px';

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
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: '60px', height: '60px', border: '6px solid #e0e0e0', borderTop: '6px solid #FFD700', borderRadius: '50%' }}
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
          padding: '15px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <h3 style={{ color: '#d81b60', marginBottom: '15px', fontSize: '18px' }}>Error Loading Products</h3>
        <p style={{ color: '#37474f', marginBottom: '15px', fontSize: '14px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const getDestination = () => {
    if (location.pathname === '/') {
      return '/products';
    } else if (location.pathname === '/products') {
      return '/';
    } else {
      return '/';
    }
  };

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
          padding: '15px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <h3 style={{ marginTop: '15px', fontSize: '20px', color: '#263238' }}>No products available yet.</h3>
        <Link
          to={getDestination()}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#FFD700',
            color: '#000',
            textDecoration: 'none',
            borderRadius: '6px',
            marginTop: '15px',
            fontSize: '14px',
          }}
        >
          Back Home
        </Link>
      </motion.div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
        fontFamily: '"Inter", sans-serif',
        width: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Carousel and Search Bar Side by Side */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '8px',
          padding: '8px',
          backgroundColor: '#000',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <div style={{ flex: 2, minWidth: 0, overflow: 'hidden' }}>
          <FeaturedCarousel products={carouselProducts} isMobile={isMobile} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} isMobile={isMobile} />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <motion.div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#000',
          padding: isMobile ? '6px 8px' : '8px 12px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          width: '100%',
          borderBottom: '1px solid #FFD700',
          boxSizing: 'border-box',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            gap: isMobile ? '4px' : '8px',
            width: '100%',
            overflowX: 'auto',
            paddingBottom: '6px',
            minWidth: 'max-content',
          }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setFilterCategory(category.name)}
              style={{
                backgroundColor: filterCategory === category.name ? category.color : '#333',
                color: '#fff',
                border: `1px solid ${filterCategory === category.name ? category.color : '#555'}`,
                borderRadius: '6px',
                padding: isMobile ? '5px 6px' : '6px 10px',
                fontSize: isMobile ? '10px' : '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: filterCategory === category.name ? `0 2px 5px ${category.color}80` : 'none',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Product Count and Pagination Info */}
      <motion.div
        style={{
          padding: isMobile ? '6px 8px' : '8px 12px',
          color: '#fff',
          fontSize: isMobile ? '11px' : '13px',
          backgroundColor: '#000',
          margin: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: 1, minWidth: '0' }}>
          Showing {filteredProducts.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          {filterCategory !== 'All' && ` in ${filterCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        {totalPages > 1 && <div style={{ fontSize: isMobile ? '11px' : '13px' }}>Page {currentPage} of {totalPages}</div>}
      </motion.div>

      {/* Product Grid: Centered and Responsive */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          padding: isMobile ? '0 4px' : '0 6px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: gridGap,
            width: '100%',
            maxWidth: '1400px',
            boxSizing: 'border-box',
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product?.id || index}
              variants={itemVariants}
              whileHover={{ y: -3, boxShadow: '0 4px 10px rgba(0,0,0,0.12)', transition: { duration: 0.2 } }}
              style={{
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {product && (
                <>
                  <ProductCard
                    product={product}
                    onSelect={openProductDetails}
                    onAddToCart={handleAddToCart}
                    onDelete={handleDelete}
                    onEdit={handleEditClick}
                    currentUser={currentUser}
                    isMobile={isMobile}
                    style={{ width: '100%' }}
                  />
                  <motion.button
                    onClick={() => handleBuy(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: '6px',
                      backgroundColor: '#FFD700',
                      color: '#000',
                      border: 'none',
                      borderRadius: '0 0 6px 6px',
                      fontSize: isMobile ? '12px' : '13px',
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
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '3px' : '6px',
            padding: isMobile ? '8px' : '15px',
            flexWrap: 'wrap',
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
              padding: isMobile ? '5px 6px' : '6px 10px',
              backgroundColor: currentPage === 1 ? '#555' : '#FFD700',
              color: currentPage === 1 ? '#aaa' : '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              minWidth: isMobile ? '28px' : '35px',
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
              padding: isMobile ? '5px 6px' : '6px 10px',
              backgroundColor: currentPage === 1 ? '#555' : '#FFD700',
              color: currentPage === 1 ? '#aaa' : '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              minWidth: isMobile ? '28px' : '35px',
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
                  padding: isMobile ? '5px 6px' : '6px 10px',
                  backgroundColor: currentPage === pageNum ? '#FFD700' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: isMobile ? '11px' : '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: isMobile ? '28px' : '35px',
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
              padding: isMobile ? '5px 6px' : '6px 10px',
              backgroundColor: currentPage === totalPages ? '#555' : '#FFD700',
              color: currentPage === totalPages ? '#aaa' : '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              minWidth: isMobile ? '28px' : '35px',
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
              padding: isMobile ? '5px 6px' : '6px 10px',
              backgroundColor: currentPage === totalPages ? '#555' : '#FFD700',
              color: currentPage === totalPages ? '#aaa' : '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              minWidth: isMobile ? '28px' : '35px',
            }}
          >
            Last
          </motion.button>
        </motion.div>
      )}

      {/* No Products Found */}
      {filteredProducts.length === 0 && products.length > 0 && (
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            backgroundColor: '#fff',
            margin: '10px 0',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            width: 'calc(100% - 16px)',
            boxSizing: 'border-box',
          }}
        >
          <motion.img
            src="/images/icons/search-empty.png"
            alt="No results"
            width="100"
            animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h3 style={{ marginTop: '15px', fontSize: '18px', color: '#263238', fontWeight: 600 }}>No products found</h3>
          <p style={{ fontSize: '13px', color: '#78909c', maxWidth: '500px', marginTop: '8px', textAlign: 'center' }}>
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
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            Reset Filters
          </motion.button>
        </motion.div>
      )}

      {/* Product Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '8px' : '12px',
              overflowY: 'auto',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                width: '100%',
                maxWidth: isMobile ? '95vw' : '700px',
                maxHeight: isMobile ? '90vh' : '85vh',
                padding: isMobile ? '12px' : '20px',
                position: 'relative',
                overflowY: 'auto',
                color: '#263238',
                boxShadow: '0 0 25px rgba(25,118,210,0.3)',
                border: '1px solid #e0e0e0',
                boxSizing: 'border-box',
              }}
            >
              <motion.button
                onClick={closeProductDetails}
                whileHover={{ scale: 1.05, backgroundColor: '#1565c0' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#1976d2',
                  border: 'none',
                  fontSize: '15px',
                  cursor: 'pointer',
                  color: '#fff',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                ×
              </motion.button>
              <div
                style={{
                  width: '100%',
                  height: isMobile ? '140px' : '250px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <img
                  src={getCurrentImage()}
                  alt={selectedProduct.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '6px' }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  padding: '6px 0',
                  scrollbarWidth: 'none',
                  marginBottom: '12px',
                }}
              >
                {[selectedProduct.image_path, ...(selectedProduct.extra_images || [])].map((img, index) => (
                  <motion.div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      minWidth: isMobile ? '45px' : '50px',
                      height: isMobile ? '45px' : '50px',
                      border: currentImageIndex === index ? '2px solid #FFD700' : '1px solid #e0e0e0',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={`${API_URL}/api/uploads/${img}`}
                      alt={`Thumbnail ${index}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </motion.div>
                ))}
              </div>
              <h3
                style={{
                  color: '#263238',
                  margin: '0 0 10px 0',
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {selectedProduct.name}
              </h3>
              <p
                style={{
                  fontSize: isMobile ? '14px' : '18px',
                  fontWeight: '600',
                  color: '#FFD700',
                  margin: '0 0 10px 0',
                  textAlign: 'center',
                }}
              >
                KES {selectedProduct.price.toLocaleString()}
              </p>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: isMobile ? '8px' : '10px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  borderLeft: '3px solid #FFD700',
                  fontSize: isMobile ? '13px' : '15px',
                  lineHeight: '1.5',
                  maxHeight: '130px',
                  overflowY: 'auto',
                }}
              >
                <p style={{ color: '#546e7a', margin: 0, wordBreak: 'break-word' }}>{selectedProduct.description}</p>
              </div>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: isMobile ? '6px' : '8px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  border: '1px solid #e0e0e0',
                  fontSize: isMobile ? '13px' : '15px',
                }}
              >
                <p style={{ color: '#78909c', margin: '0 0 4px 0' }}>Category</p>
                <p style={{ color: '#263238', fontWeight: '500', margin: 0 }}>{selectedProduct.category || 'N/A'}</p>
              </div>
              <div style={{ display: 'flex', gap: isMobile ? '5px' : '6px', marginBottom: '10px' }}>
                <motion.button
                  onClick={() => handleAddToCart(selectedProduct)}
                  whileHover={{ scale: 1.05, backgroundColor: '#1565c0' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: isMobile ? '6px' : '8px',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Add to Cart
                </motion.button>
              </div>
              {currentUser && (currentUser.is_admin || selectedProduct.user_id === currentUser.id) && (
                <div
                  style={{
                    backgroundColor: '#f5f5f5',
                    padding: isMobile ? '6px' : '8px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #FFD700',
                    fontSize: isMobile ? '11px' : '13px',
                  }}
                >
                  <p style={{ color: '#263238', fontWeight: '600', margin: '0 0 5px 0' }}>Admin Actions</p>
                  <div style={{ display: 'flex', gap: isMobile ? '5px' : '6px' }}>
                    <motion.button
                      onClick={() => handleEditClick(selectedProduct)}
                      whileHover={{ scale: 1.05, backgroundColor: '#1565c0' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        flex: 1,
                        padding: isMobile ? '5px' : '6px',
                        backgroundColor: '#FFD700',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: isMobile ? '10px' : '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(selectedProduct.id)}
                      whileHover={{ scale: 1.05, backgroundColor: '#c2185b' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        flex: 1,
                        padding: isMobile ? '5px' : '6px',
                        backgroundColor: '#d81b60',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: isMobile ? '10px' : '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 1001,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '8px' : '15px',
              overflowY: 'auto',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                width: '100%',
                maxWidth: isMobile ? '95vw' : '550px',
                maxHeight: isMobile ? '90vh' : '90vh',
                padding: isMobile ? '12px' : '20px',
                position: 'relative',
                overflowY: 'auto',
                color: '#263238',
                boxShadow: '0 0 25px rgba(25,118,210,0.3)',
                border: '1px solid #e0e0e0',
                boxSizing: 'border-box',
              }}
            >
              <motion.button
                onClick={() => setEditingProduct(null)}
                whileHover={{ scale: 1.05, backgroundColor: '#1565c0' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#1976d2',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#fff',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                ×
              </motion.button>
              <h2
                style={{
                  color: '#263238',
                  marginBottom: '12px',
                  fontSize: isMobile ? '16px' : '20px',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                Edit Product
              </h2>
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      color: '#78909c',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: 500,
                    }}
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: isMobile ? '6px' : '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      color: '#263238',
                      fontSize: isMobile ? '11px' : '14px',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      color: '#78909c',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: 500,
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    style={{
                      width: '100%',
                      padding: isMobile ? '6px' : '10px',
                      borderRadius: '6px',
                      backgroundColor: '#f5f5f5',
                      color: '#263238',
                      fontSize: isMobile ? '11px' : '14px',
                      minHeight: '70px',
                      border: '1px solid #e0e0e0',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      color: '#78909c',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: 500,
                    }}
                  >
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditFormChange}
                    required
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: isMobile ? '6px' : '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      color: '#263238',
                      fontSize: isMobile ? '11px' : '14px',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      color: '#78909c',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: 500,
                    }}
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    style={{
                      width: '100%',
                      padding: isMobile ? '6px' : '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      color: '#263238',
                      fontSize: isMobile ? '11px' : '14px',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#FFD700')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  >
                    <option value="">Select a category</option>
                    {categories.filter((c) => c.name !== 'All').map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      color: '#78909c',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: 500,
                    }}
                  >
                    Update Images (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: isMobile ? '6px' : '10px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      color: '#263238',
                      fontSize: isMobile ? '11px' : '14px',
                    }}
                  />
                  <p style={{ marginTop: '5px', fontSize: isMobile ? '9px' : '12px', color: '#78909c' }}>
                    First image will be used as the main image
                  </p>
                </div>
                {editImagePreviews.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '5px',
                        color: '#78909c',
                        fontSize: isMobile ? '11px' : '14px',
                        fontWeight: 500,
                      }}
                    >
                      Image Previews
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        padding: '6px 0',
                        scrollbarWidth: 'none',
                      }}
                    >
                      {editImagePreviews.map((preview, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            minWidth: isMobile ? '45px' : '50px',
                            height: isMobile ? '45px' : '50px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {index >= (editImages.length > 0 ? 1 : 0) && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPreviews = [...editImagePreviews];
                                newPreviews.splice(index, 1);
                                setEditImagePreviews(newPreviews);
                              }}
                              whileHover={{ scale: 1.1, backgroundColor: '#c2185b' }}
                              whileTap={{ scale: 0.9 }}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              ×
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: isMobile ? '5px' : '12px', marginTop: '12px' }}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, backgroundColor: '#1565c0' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: isMobile ? '8px' : '10px 20px',
                      backgroundColor: '#FFD700',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    whileHover={{ scale: 1.05, backgroundColor: '#e0e0e0' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: isMobile ? '8px' : '10px 20px',
                      backgroundColor: '#f5f5f5',
                      color: '#263238',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: isMobile ? '11px' : '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;
