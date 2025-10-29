import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useLocation, useNavigate } from 'react-router-dom';
import { showToast } from './utils';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductList.css';

const ProductList = ({ reviews, setReviews, selectedCategory }) => {
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

  const location = useLocation();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 769px) and (max-width: 1024px)' });

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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, filterCategory]);

  const getFilteredProducts = () => {
    try {
      if (!Array.isArray(products)) return [];
      const searchLower = searchQuery.toLowerCase();
      return products.filter((product) => {
        if (!product) return false;
        const categoryMatch = filterCategory === 'All' || product.category === filterCategory;
        if (!searchQuery) return categoryMatch;
        const priceRangeMatch = searchQuery.match(/^(\d+)-(\d+)$/);
        if (priceRangeMatch) {
          const [min, max] = priceRangeMatch.slice(1).map(Number);
          return categoryMatch && product.price >= min && product.price <= max;
        }
        const productValues = [
          product.name?.toLowerCase(),
          product.description?.toLowerCase(),
          product.category?.toLowerCase(),
          product.price?.toString().toLowerCase(),
          product.user_id?.toString().toLowerCase(),
          ...(product.extra_images?.map(img => img.toLowerCase()) || []),
          ...reviews
            .filter(r => r.productId === product.id)
            .flatMap(r => [
              r.userName?.toLowerCase(),
              r.comment?.toLowerCase(),
              r.rating?.toString().toLowerCase(),
            ]),
        ];
        const exactMatches = [
          product.user_id?.toString() === searchQuery,
          product.category?.toLowerCase() === searchLower,
        ];
        const partialMatches = productValues.some(value => value?.includes(searchLower));
        return categoryMatch && (exactMatches.some(Boolean) || partialMatches);
      });
    } catch (err) {
      console.error('Error filtering products:', err);
      return [];
    }
  };

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

  const handleProductSelect = (product) => {
    navigate(`/products/${product.id}`);
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

  const gridColumns = isMobile
    ? 'repeat(2, 1fr)'
    : isTablet
    ? 'repeat(3, 1fr)'
    : 'repeat(7, 1fr)';

  if (isLoading) {
    return (
      <div className="loading-container">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="loading-spinner"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Products</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
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
        className="no-products-container"
      >
        <motion.div className="no-products-box">
          <motion.img
            src="/images/icons/empty-box.png"
            alt="No products"
            className="no-products-image"
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
          />
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            No products available yet.
          </motion.h3>
          <motion.p
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
              className="back-home-button"
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
    <div className="product-list-page">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="site-description"
      >
        <p>
          Explore a vibrant marketplace of electronics and appliances. Shop now or list your own products!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="search-bar-section"
      >
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      <motion.div
        className="categories-wrapper"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="categories-container">
          {categories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setFilterCategory(category.name)}
              className="category-button"
              style={{
                backgroundColor: filterCategory === category.name ? category.color : '#fff',
                color: filterCategory === category.name ? '#fff' : '#546e7a',
                border: `1px solid ${filterCategory === category.name ? category.color : '#e0e0e0'}`,
                boxShadow: filterCategory === category.name ? `0 2px 5px ${category.color}80` : 'none',
              }}
              whileHover={{ scale: 1.05, boxShadow: `0 2px 5px ${category.color}80` }}
              whileTap={{ scale: 0.95 }}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
        className="product-count"
      >
        <div>
          Showing {filteredProducts.length} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          {filterCategory !== 'All' && ` in ${filterCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        {totalPages > 1 && (
          <div>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </motion.div>

      <motion.div
        className="product-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          gridTemplateColumns: gridColumns
        }}
      >
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product?.id || index}
            className="product-card-wrapper"
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(0,0,0,0.15)', transition: { duration: 0.2 } }}
          >
            {product && (
              <>
                <ProductCard
                  product={product}
                  onSelect={handleProductSelect}
                  onAddToCart={handleAddToCart}
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                  currentUser={currentUser}
                />
                <motion.button
                  onClick={() => handleBuy(product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="order-button"
                >
                  Order Now
                </motion.button>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
          className="pagination"
        >
          <motion.button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            className="pagination-button"
            style={{
              backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1976d2',
              color: currentPage === 1 ? '#78909c' : '#fff',
              cursor: currentPage === 1 ? 'default' : 'pointer',
            }}
          >
            First
          </motion.button>
          <motion.button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            className="pagination-button"
            style={{
              backgroundColor: currentPage === 1 ? '#e0e0e0' : '#1976d2',
              color: currentPage === 1 ? '#78909c' : '#fff',
              cursor: currentPage === 1 ? 'default' : 'pointer',
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
                className="pagination-button"
                style={{
                  backgroundColor: currentPage === pageNum ? '#1565c0' : '#1976d2',
                  color: '#fff',
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
            className="pagination-button"
            style={{
              backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1976d2',
              color: currentPage === totalPages ? '#78909c' : '#fff',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
            }}
          >
            Next
          </motion.button>
          <motion.button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
            whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            className="pagination-button"
            style={{
              backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#1976d2',
              color: currentPage === totalPages ? '#78909c' : '#fff',
              cursor: currentPage === totalPages ? 'default' : 'pointer',
            }}
          >
            Last
          </motion.button>
        </motion.div>
      )}

      {filteredProducts.length === 0 && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="empty-state"
        >
          <motion.img
            src="/images/icons/search-empty.png"
            alt="No results"
            className="empty-state-image"
            animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h3>No products found</h3>
          <p>
            {`We couldn't find any products matching your ${searchQuery ? 'search' : 'category'} criteria. Try adjusting your filters.`}
          </p>
          <motion.button
            onClick={() => {
              setFilterCategory('All');
              setSearchQuery('');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="reset-filters-button"
          >
            Reset Filters
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ProductList;
