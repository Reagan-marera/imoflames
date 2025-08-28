import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { showToast } from './utils';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating';

const ProductList = ({ reviews, setReviews, selectedCategory }) => {
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

  // Hooks
  const location = useLocation();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1024px)' });

  // Categories
  const categories = [
    { name: 'All', color: '#00aaff' },
    { name: 'Phones', color: '#00aaff' },
    { name: 'TVs', color: '#8a8a8a' },
    { name: 'Laptops', color: '#2ba8db' },
    { name: 'Appliances', color: '#00aaff' },
    { name: 'Gaming', color: '#8a2be2' },
    { name: 'Accessories', color: '#4CAF50' },
  ];

  const [filterCategory, setFilterCategory] = useState('All');
  const productsPerPage = isMobile ? 12 : isTablet ? 16 : 20;

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

  // Filter products
  const getFilteredProducts = () => {
    try {
      if (!Array.isArray(products)) return [];
      return products.filter((product) => {
        if (!product) return false;
        const categoryMatch = filterCategory === 'All' || product.category === filterCategory;
        if (!searchQuery) return categoryMatch;

        const searchLower = searchQuery.toLowerCase();

        // Handle price range queries (e.g., "500-1000")
        const priceRangeMatch = searchQuery.match(/^(\d+)-(\d+)$/);
        if (priceRangeMatch) {
          const [min, max] = priceRangeMatch.slice(1).map(Number);
          return categoryMatch && product.price >= min && product.price <= max;
        }

        // Flatten all relevant fields for search
        const productValues = [
          product.name?.toLowerCase(),
          product.description?.toLowerCase(),
          product.category?.toLowerCase(),
          product.price?.toString().toLowerCase(),
          product.user_id?.toString().toLowerCase(),
          ...(product.extra_images || []).map(img => img.toLowerCase()),
          ...(reviews
            .filter(r => r.productId === product.id)
            .map(r => [
              r.userName?.toLowerCase(),
              r.comment?.toLowerCase(),
              r.rating?.toString().toLowerCase(),
            ])
            .flat()),
        ];

        // Check for exact matches (e.g., user_id or category)
        const exactMatches = [
          product.user_id?.toString() === searchQuery,
          product.category?.toLowerCase() === searchLower,
        ];

        // Check for partial matches in any field
        const partialMatches = productValues.some(value => value?.includes(searchLower));

        return categoryMatch && (exactMatches.some(Boolean) || partialMatches);
      });
    } catch (err) {
      console.error('Error filtering products:', err);
      return [];
    }
  };

  // Get product card size
  const getProductCardSize = () => {
    if (isMobile) {
      const screenWidth = window.innerWidth;
      const cardWidth = (screenWidth - 30) / 2;
      return { width: `${cardWidth}px`, height: `${cardWidth * 1.5}px` };
    }
    if (isTablet) return { width: '180px', height: '270px' };
    return { width: '220px', height: '330px' };
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
        closeProductDetails();
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
        setShowDetailsModal(false);
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
        closeProductDetails();
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRatingChange = (newRating) => {
    if (!currentUser) {
      showToast('You must be logged in to rate a product.', 'error');
      navigate('/login');
      return;
    }

    if (!selectedProduct) return;

    const existingReviewIndex = reviews.findIndex(
      (review) => review.productId === selectedProduct.id && review.userName === currentUser.username
    );

    let updatedReviews;

    if (existingReviewIndex !== -1) {
      updatedReviews = reviews.map((review, index) => {
        if (index === existingReviewIndex) {
          return { ...review, rating: newRating };
        }
        return review;
      });
      showToast('Your rating has been updated!', 'success');
    } else {
      const newReview = {
        productId: selectedProduct.id,
        userName: currentUser.username,
        rating: newRating,
        comment: '',
      };
      updatedReviews = [...reviews, newReview];
      showToast('Thank you for your rating!', 'success');
    }

    setReviews(updatedReviews);
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
        }}
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '80px',
            height: '80px',
            border: '8px solid #21262d',
            borderTop: '8px solid #00aaff',
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
          backgroundColor: '#0d1117',
        }}
      >
        <h3 style={{ color: '#d73a49', marginBottom: '20px' }}>Error Loading Products</h3>
        <p style={{ color: '#8b949e', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00aaff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
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
              color: '#333'
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
              color: '#666',
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
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3f51b5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(63, 81, 181, 0.3)',
                marginTop: '15px'
              }}
            >
              Back Home
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const filteredProducts = getFilteredProducts();
  const cardSize = getProductCardSize();

  return (
    <div
      className="product-list-page"
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        paddingBottom: '80px',
      }}
    >
      {/* Site Description */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: isMobile ? '10px 15px' : '15px 60px',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          fontSize: isMobile ? '14px' : '16px',
          color: '#666',
        }}
      >
        <p>
          Welcome to our marketplace! Browse a wide range of products from electronics to appliances.
          Find what you need, or list your own items for sale.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: isMobile ? '15px' : '20px 60px',
          backgroundColor: '#161b22',
          boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
        }}
      >
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      {/* Categories */}
      <motion.div
        className="categories-wrapper"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#fff',
          padding: isMobile ? '10px 0' : '15px 0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          borderBottom: '1px solid #e0e0e0',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="categories-container"
          style={{
            display: 'flex',
            overflowX: 'auto',
            padding: '0 10px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            gap: isMobile ? '8px' : '10px',
            width: 'max-content',
            minWidth: '100%',
          }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setFilterCategory(category.name)}
              className="category-button"
              style={{
                backgroundColor: filterCategory === category.name ? category.color : '#fff',
                color: filterCategory === category.name ? '#fff' : '#666',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: isMobile ? '6px 12px' : '10px 15px',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: filterCategory === category.name ? `0 2px 5px ${category.color}80` : 'none',
                transition: 'all 0.2s ease',
              }}
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
        transition={{ delay: 0.2 }}
        style={{
          padding: isMobile ? '10px 15px' : '15px 30px',
          color: '#666',
          fontSize: '14px',
          backgroundColor: '#fff',
          margin: '10px 15px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          Showing {filteredProducts.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          {filterCategory !== 'All' && ` in ${filterCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        {totalPages > 1 && (
          <div style={{ fontSize: '14px' }}>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </motion.div>

      {/* Product Grid */}
      <motion.div
        className="product-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: isMobile ? '10px' : '15px',
          padding: isMobile ? '10px' : '15px',
          position: 'relative',
          minWidth: '0',
          width: '100%',
          justifyItems: 'center',
        }}
      >
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product?.id || index}
            className="product-card-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(0,0,0,0.1)', transition: { duration: 0.2 } }}
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              minWidth: '0',
              width: cardSize.width,
              height: cardSize.height,
            }}
          >
            {product && (
              <ProductCard
                product={product}
                reviews={reviews.filter(r => r.productId === product.id)}
                onSelect={openProductDetails}
                onBuy={handleBuy}
                onAddToCart={handleAddToCart}
                onDelete={handleDelete}
                onEdit={handleEditClick}
                currentUser={currentUser}
                isMobile={isMobile}
                jumiaStyle={true}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '20px',
            flexWrap: 'wrap',
          }}
        >
          <motion.button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === 1 ? '#21262d' : '#00aaff',
              color: currentPage === 1 ? '#8b949e' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              minWidth: '40px',
            }}
          >
            First
          </motion.button>
          <motion.button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === 1 ? '#21262d' : '#00aaff',
              color: currentPage === 1 ? '#8b949e' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: currentPage === 1 ? 'default' : 'pointer',
              minWidth: '40px',
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
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === pageNum ? '#0077cc' : '#00aaff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minWidth: '40px',
                }}
              >
                {pageNum}
              </motion.button>
            );
          })}
          <motion.button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === totalPages ? '#21262d' : '#00aaff',
              color: currentPage === totalPages ? '#8b949e' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              minWidth: '40px',
            }}
          >
            Next
          </motion.button>
          <motion.button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === totalPages ? '#21262d' : '#00aaff',
              color: currentPage === totalPages ? '#8b949e' : '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
              minWidth: '40px',
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
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            color: '#e0e0e0',
            textAlign: 'center',
            padding: '0 20px',
            backgroundColor: '#161b22',
            margin: '15px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          <motion.img
            src="/images/icons/search-empty.png"
            alt="No results"
            width="120"
            animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h3 style={{ marginTop: '20px', fontSize: '20px', color: '#e0e0e0' }}>No products found</h3>
          <p style={{ fontSize: '14px', color: '#8b949e', maxWidth: '500px', marginTop: '10px' }}>
            {`We couldn't find any products matching your ${searchQuery ? 'search' : 'category'} criteria. Try adjusting your filters.`}
          </p>
          <motion.button
            onClick={() => {
              setFilterCategory('All');
              setSearchQuery('');
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#00aaff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
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
            transition={{ duration: 0.3 }}
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
              padding: '8px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: '#161b22',
                borderRadius: '10px',
                width: '100%',
                maxWidth: isMobile ? '90vw' : '800px',
                maxHeight: isMobile ? '90vh' : '90vh',
                padding: isMobile ? '1rem' : '2rem',
                position: 'relative',
                overflowY: 'auto',
                color: '#e0e0e0',
                boxShadow: '0 0 30px rgba(0,170,255,0.5)',
                border: '1px solid #00aaff',
              }}
            >
              {/* Close Button */}
              <motion.button
                onClick={closeProductDetails}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'sticky',
                  top: '5px',
                  right: '5px',
                  background: '#00aaff',
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
                  float: 'right',
                  zIndex: 2,
                }}
              >
                ×
              </motion.button>

              {/* Product Image */}
              <div
                style={{
                  width: '100%',
                  height: '160px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '8px',
                  backgroundColor: '#0d1117',
                  borderRadius: '4px',
                  border: '1px solid #21262d',
                }}
              >
                <img
                  src={getCurrentImage()}
                  alt={selectedProduct.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div
                style={{
                  display: 'flex',
                  gap: '5px',
                  overflowX: 'auto',
                  padding: '5px 0',
                  scrollbarWidth: 'none',
                  marginBottom: '8px',
                }}
              >
                {[selectedProduct.image_path, ...(selectedProduct.extra_images || [])].map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      minWidth: '45px',
                      height: '45px',
                      border: currentImageIndex === index ? '1.5px solid #00aaff' : '1px solid #21262d',
                      borderRadius: '3px',
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
                  </div>
                ))}
              </div>

              {/* Product Name */}
              <h3
                style={{
                  color: '#e0e0e0',
                  margin: '0 0 10px 0',
                  fontSize: '24px',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {selectedProduct.name}
              </h3>

              {/* Product Price */}
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#00aaff',
                  margin: '0 0 16px 0',
                  textAlign: 'center',
                }}
              >
                KES {selectedProduct.price.toLocaleString()}
              </p>

              {/* Description */}
              <div
                style={{
                  backgroundColor: '#0d1117',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  borderLeft: '3px solid #00aaff',
                  fontSize: '16px',
                  lineHeight: '1.6',
                }}
              >
                <p style={{ color: '#8b949e', margin: 0 }}>
                  {selectedProduct.description}
                </p>
              </div>

              {/* New Rating Section */}
              <div style={{ marginTop: '16px', borderTop: '1px solid #21262d', paddingTop: '16px' }}>
                <h4 style={{ marginBottom: '8px', color: '#e0e0e0', fontSize: '20px', textAlign: 'center' }}>
                  {currentUser ? 'Rate this Product' : 'Log in to Rate'}
                </h4>
                {currentUser ? (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <StarRating
                      size={32}
                      rating={
                        reviews.find(r => r.productId === selectedProduct.id && r.userName === currentUser.username)?.rating || 0
                      }
                      onRatingChange={handleRatingChange}
                    />
                  </div>
                ) : (
                   <p style={{ textAlign: 'center', color: '#8b949e' }}>
                     <Link to="/login">Login</Link> to share your opinion.
                   </p>
                )}
                <div style={{textAlign: 'center', marginTop: '10px', color: '#8b949e'}}>
                  <p>Average rating:</p>
                  <StarRating
                      rating={
                          (() => {
                              const productReviews = reviews.filter(r => r.productId === selectedProduct.id);
                              if (productReviews.length === 0) return 0;
                              const avg = productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;
                              return avg;
                          })()
                      }
                  />
                </div>
              </div>

              {/* Category */}
              <div
                style={{
                  backgroundColor: '#0d1117',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #21262d',
                  marginBottom: '16px',
                  fontSize: '16px',
                }}
              >
                <p style={{ color: '#8b949e', margin: '0 0 5px 0' }}>Category</p>
                <p style={{ color: '#e0e0e0', fontWeight: '500', margin: 0 }}>
                  {selectedProduct.category || 'N/A'}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <button
                  onClick={() => handleBuy(selectedProduct)}
                  style={{
                    flex: 1,
                    padding: '7px',
                    backgroundColor: '#00aaff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Order Now
                </button>
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  style={{
                    flex: 1,
                    padding: '7px',
                    backgroundColor: '#0071eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Add to Cart
                </button>
              </div>

              {/* Admin Actions */}
              {currentUser && (currentUser.is_admin || selectedProduct.user_id === currentUser.id) && (
                <div
                  style={{
                    backgroundColor: '#0d1117',
                    padding: '8px',
                    borderRadius: '4px',
                    borderLeft: '3px solid #00aaff',
                    fontSize: '12px',
                  }}
                >
                  <p style={{ color: '#e0e0e0', fontWeight: '500', margin: '0 0 6px 0' }}>
                    Admin Actions
                  </p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEditClick(selectedProduct)}
                      style={{
                        flex: 1,
                        padding: '5px',
                        backgroundColor: '#0071eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedProduct.id)}
                      style={{
                        flex: 1,
                        padding: '5px',
                        backgroundColor: '#d73a49',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
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
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 1001,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: isMobile ? '10px' : '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              style={{
                backgroundColor: '#222',
                borderRadius: '10px',
                width: '100%',
                maxWidth: isMobile ? '95vw' : '600px',
                maxHeight: isMobile ? '95vh' : '90vh',
                padding: isMobile ? '15px' : '30px',
                position: 'relative',
                overflowY: 'auto',
                color: '#fff',
                boxShadow: '0 0 30px rgba(0,113,235,0.5)',
                border: '1px solid #0071eb',
              }}
            >
              <motion.button
                onClick={() => setEditingProduct(null)}
                whileHover={{ rotate: 90, backgroundColor: '#0063c7' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#0071eb',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#fff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                ×
              </motion.button>
              <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: isMobile ? '20px' : '24px', textAlign: 'center' }}>
                Edit Product
              </h2>
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: isMobile ? '14px' : '16px' }}>
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
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '4px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      fontSize: isMobile ? '14px' : '16px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: isMobile ? '14px' : '16px' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '4px',
                      backgroundColor: '#333',
                      color: '#fff',
                      fontSize: isMobile ? '14px' : '16px',
                      minHeight: '100px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: isMobile ? '14px' : '16px' }}>
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
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '4px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      fontSize: isMobile ? '14px' : '16px',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: isMobile ? '14px' : '16px' }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditFormChange}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '4px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      fontSize: isMobile ? '14px' : '16px',
                    }}
                  >
                    <option value="">Select a category</option>
                    {categories.filter((c) => c.name !== 'All').map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: isMobile ? '14px' : '16px' }}>
                    Update Images (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: isMobile ? '10px' : '12px',
                      borderRadius: '4px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      fontSize: isMobile ? '14px' : '16px',
                    }}
                  />
                  <p style={{ marginTop: '8px', fontSize: isMobile ? '12px' : '14px', color: '#777' }}>
                    First image will be used as the main image
                  </p>
                </div>
                {editImagePreviews.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: isMobile ? '14px' : '16px' }}>
                      Image Previews
                    </label>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0' }}>
                      {editImagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          style={{
                            minWidth: '60px',
                            height: '60px',
                            border: '1px solid #444',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {index >= (editImages.length > 0 ? 1 : 0) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPreviews = [...editImagePreviews];
                                newPreviews.splice(index, 1);
                                setEditImagePreviews(newPreviews);
                              }}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: isMobile ? '10px' : '15px',
                    marginTop: '20px',
                  }}
                >
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, backgroundColor: '#0063c7' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: isMobile ? '12px' : '12px 25px',
                      backgroundColor: '#0071eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    whileHover={{ scale: 1.05, backgroundColor: '#444' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: isMobile ? '12px' : '12px 25px',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
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

      {/* Fixed Back Home Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          padding: '12px 24px',
          backgroundColor: '#00aaff',
          color: '#fff',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>🏠</span>
        <span>Back Home</span>
      </motion.button>
    </div>
  );
};

export default ProductList;
