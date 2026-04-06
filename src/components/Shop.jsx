import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaShoppingCart, FaTimes, FaEdit, FaTrash,
  FaSlidersH, FaStar, FaStarHalfAlt, FaRegStar, FaBolt,
  FaLaptop, FaMobileAlt, FaHeadphones, FaGamepad, FaCamera, FaTv,
  FaSpinner, FaHeart, FaTag
} from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviews, setReviews] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [editImages, setEditImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const productsPerPage = 12;

  const categoryIcons = {
    'Phones': <FaMobileAlt size={12} />,
    'Laptops': <FaLaptop size={12} />,
    'TVs': <FaTv size={12} />,
    'Audio': <FaHeadphones size={12} />,
    'Gaming': <FaGamepad size={12} />,
    'Cameras': <FaCamera size={12} />,
    'All': <FaBolt size={12} />
  };

  useEffect(() => {
    fetchProducts();
    fetchCurrentUser();
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products, priceRange]);

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

  const fetchProductReviews = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        const averageRating = data.length > 0
          ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
          : 0;
        return { count: data.length, average: averageRating };
      }
      return { count: 0, average: 0 };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { count: 0, average: 0 };
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

        const uniqueCategories = ['All', ...new Set(productsArray.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);

        const reviewsData = {};
        for (const product of productsArray) {
          reviewsData[product.id] = await fetchProductReviews(product.id);
        }
        setReviews(reviewsData);
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
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.price?.toString().includes(searchLower)
      );
    }

    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: 1 })
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
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast('Product deleted successfully!', 'success');
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

    setIsSubmittingEdit(true);

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
        fetchProducts();
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Failed to update product', 'error');
    } finally {
      setIsSubmittingEdit(false);
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

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setShowPriceFilter(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} style={styles.starFilled} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" style={styles.starFilled} />);
    }
    while (stars.length < 5) {
      stars.push(<FaRegStar key={stars.length} style={styles.starEmpty} />);
    }
    return stars;
  };

  const hasProducts = Array.isArray(filteredProducts) && filteredProducts.length > 0;

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    },
    content: {
      flex: 1,
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '60px 20px 40px',
      width: '100%'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '8px',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      fontWeight: '400'
    },
    filterBar: {
  background: '#f1fded',
  borderRadius: '16px',
  padding: '16px',              // slightly reduced for small screens
  marginBottom: '24px',
  border: '1px solid #e9ecef',
  width: '100%',               // ensure it never overflows parent
  boxSizing: 'border-box',     // critical for padding overflow fix
},

searchWrapper: {
  position: 'relative',
  marginBottom: '16px',
  width: '100%',               // full width on small screens
  maxWidth: '500px',
  marginLeft: 'auto',
  marginRight: 'auto',
},

searchIcon: {
  position: 'absolute',
  left: '12px',                // slightly tighter for mobile
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#adb5bd',
  fontSize: '16px',
  pointerEvents: 'none',       // prevents blocking input tap
},

searchInput: {
  width: '100%',
  padding: '12px 16px 12px 40px', // reduce right padding (50px was too large)
  background: '#ffffff',
  border: '1px solid #dee2e6',
  borderRadius: '12px',
  fontSize: '14px',
  color: '#212529',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box',     // prevents overflow from padding
},

    clearSearch: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#adb5bd',
      cursor: 'pointer',
      fontSize: '14px'
    },
    categoryScroll: {
      display: 'flex',
      gap: '10px',
      overflowX: 'auto',
      paddingBottom: '12px',
      marginBottom: '16px',
      scrollbarWidth: 'thin'
    },
    categoryChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 18px',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '40px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#495057',
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    },
    categoryChipActive: {
      background: '#000000',
      borderColor: '#000000',
      color: '#ffffff'
    },
    filterActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center'
    },
    filterBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 18px',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '40px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#495057',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    resetBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 18px',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '40px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#dc3545',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    pricePanel: {
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      border: '1px solid #e9ecef'
    },
    priceRange: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    priceInput: {
      width: '130px',
      padding: '10px 12px',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#212529',
      outline: 'none'
    },
    priceDash: {
      color: '#adb5bd',
      fontWeight: '500'
    },
    clearPrice: {
      padding: '10px 18px',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#495057',
      cursor: 'pointer'
    },
    resultsCount: {
      textAlign: 'center',
      marginBottom: '24px',
      fontSize: '13px',
      color: '#6c757d'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid #e9ecef',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      minHeight: '280px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    cardImageContainer: {
      position: 'relative',
      width: '100%',
      height: '140px',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      padding: '12px',
      transition: 'transform 0.3s ease'
    },
    cardActions: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      display: 'flex',
      gap: '6px',
      zIndex: 2
    },
    editAction: {
      background: '#000000',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '4px 10px',
      fontSize: '10px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    deleteAction: {
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '4px 10px',
      fontSize: '10px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    cardInfo: {
      padding: '14px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '6px',
      color: '#212529',
      whiteSpace: 'normal',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    },
    cardCategory: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '11px',
      color: '#6c757d',
      marginBottom: '6px'
    },
    cardRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '8px',
      fontSize: '11px',
      color: '#adb5bd'
    },
    starFilled: {
      color: '#fbbf24',
      fontSize: '11px'
    },
    starEmpty: {
      color: '#e9ecef',
      fontSize: '11px'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto'
    },
    cardPrice: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#000000'
    },
    cardCart: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px',
      background: '#000000',
      color: '#ffffff',
      border: 'none',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: '500',
      cursor: 'pointer',
      width: '28px',
      height: '28px'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '20px',
      flexWrap: 'wrap'
    },
    pageBtn: {
      padding: '8px 18px',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      color: '#495057',
      cursor: 'pointer',
      fontSize: '13px',
      transition: 'all 0.2s'
    },
    pageDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    pageNumbers: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    pageNumber: {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      color: '#495057',
      cursor: 'pointer',
      fontSize: '13px'
    },
    pageActive: {
      background: '#000000',
      color: '#ffffff',
      borderColor: '#000000'
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px',
      gap: '12px'
    },
    loadingSpinner: {
      fontSize: '32px',
      color: '#000000',
      animation: 'spin 1s linear infinite'
    },
    empty: {
      textAlign: 'center',
      padding: '60px',
      background: '#f8f9fa',
      borderRadius: '12px'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '12px'
    },
    emptyBtn: {
      marginTop: '16px',
      padding: '10px 24px',
      background: '#000000',
      color: '#ffffff',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500'
    },
    footer: {
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e9ecef',
      padding: '30px 20px',
      marginTop: '40px'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center'
    },
    footerIcon: {
      fontSize: '24px',
      color: '#000000',
      marginBottom: '12px'
    },
    footerText: {
      fontSize: '14px',
      color: '#495057',
      marginBottom: '6px'
    },
    footerSubtext: {
      fontSize: '12px',
      color: '#adb5bd'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    modal: {
      background: '#ffffff',
      borderRadius: '16px',
      maxWidth: '500px',
      width: '100%',
      padding: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      color: '#999',
      cursor: 'pointer'
    },
    modalInput: {
      width: '100%',
      padding: '10px 12px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#333',
      fontFamily: 'inherit',
      outline: 'none'
    },
    modalTextarea: {
      width: '100%',
      padding: '10px 12px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#333',
      fontFamily: 'inherit',
      resize: 'vertical'
    },
    modalFile: {
      width: '100%',
      padding: '8px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '12px'
    },
    modalPreviews: {
      display: 'flex',
      gap: '8px',
      marginTop: '10px',
      flexWrap: 'wrap'
    },
    modalPreview: {
      width: '50px',
      height: '50px',
      objectFit: 'cover',
      borderRadius: '6px'
    },
    modalActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px'
    },
    modalSave: {
      flex: 1,
      padding: '10px',
      background: '#000000',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    },
    modalCancel: {
      flex: 1,
      padding: '10px',
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      color: '#666',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500'
    },
    spinner: {
      animation: 'spin 1s linear infinite'
    }
  };

  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Mobile: 2 columns (Jumia-like) */
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 16px !important;
      }
      .content {
        padding: 40px 12px 30px !important;
      }
      .filterBar {
        padding: 15px !important;
      }
      .searchWrapper {
        max-width: 100% !important;
      }
      .searchInput {
        padding: 12px 45px 12px 42px !important;
        font-size: 13px !important;
      }
      .categoryChip {
        padding: 6px 14px !important;
        font-size: 12px !important;
      }
      .card {
        min-height: 260px !important;
      }
      .cardImageContainer {
        height: 130px !important;
      }
      .cardTitle {
        font-size: 13px !important;
      }
      .cardPrice {
        font-size: 14px !important;
      }
      .cardInfo {
        padding: 12px !important;
      }
      .title {
        font-size: 24px !important;
      }
    }

    /* Small mobile: still 2 columns but smaller */
    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
      }
      .filterActions {
        width: 100%;
        justify-content: space-between;
      }
      .filterBtn, .resetBtn {
        flex: 1;
        justifyContent: center;
        font-size: 12px !important;
        padding: 6px 12px !important;
      }
      .priceInput {
        width: 100px !important;
      }
      .pageBtn, .pageNumber {
        padding: 6px 12px !important;
        font-size: 12px !important;
      }
      .categoryChip span {
        font-size: 11px !important;
      }
      .cardTitle {
        font-size: 12px !important;
      }
      .cardPrice {
        font-size: 13px !important;
      }
      .cardCart {
        width: 28px !important;
        height: 28px !important;
      }
    }

    .categoryScroll::-webkit-scrollbar {
      height: 4px;
    }
    .categoryScroll::-webkit-scrollbar-track {
      background: #e9ecef;
      border-radius: 4px;
    }
    .categoryScroll::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .cardImageContainer:hover img {
      transform: scale(1.05);
    }
    input:focus, textarea:focus {
      border-color: #000000 !important;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.05) !important;
    }
    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Shop Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Shop Electronics</h1>
          <p style={styles.subtitle}>Discover the latest tech at great prices</p>
        </div>

        {/* Search and Filter Section */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
                <FaTimes />
              </button>
            )}
          </div>

          <div style={styles.categoryScroll}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.categoryChip,
                  ...(selectedCategory === cat ? styles.categoryChipActive : {})
                }}
              >
                {categoryIcons[cat]}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div style={styles.filterActions}>
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              style={styles.filterBtn}
            >
              <FaSlidersH /> Price
            </button>
            {(selectedCategory !== 'All' || searchTerm || priceRange.min || priceRange.max) && (
              <button onClick={resetFilters} style={styles.resetBtn}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Price Filter */}
        <AnimatePresence>
          {showPriceFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.pricePanel}
            >
              <div style={styles.priceRange}>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  style={styles.priceInput}
                />
                <span style={styles.priceDash}>—</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  style={styles.priceInput}
                />
                <button onClick={() => setPriceRange({ min: '', max: '' })} style={styles.clearPrice}>
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div style={styles.resultsCount}>
          <span>{filteredProducts.length} products found</span>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div style={styles.loading}>
            <FaSpinner style={styles.loadingSpinner} />
            <p>Loading products...</p>
          </div>
        ) : !hasProducts ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button onClick={resetFilters} style={styles.emptyBtn}>Clear filters</button>
          </div>
        ) : (
          <>
            <div style={styles.grid} className="grid">
              {filteredProducts.map((product) => {
                const reviewData = reviews[product.id] || { count: 0, average: 0 };
                return (
                  <motion.div
                    key={product.id}
                    style={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div style={styles.cardImageContainer}>
                      <img
                        src={product.image_path ? `${API_URL}/uploads/${product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'}
                        alt={product.name}
                        style={styles.cardImage}
                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                      />
                      {canEditDelete(product) && (
                        <div style={styles.cardActions}>
                          <button onClick={(e) => handleEditProduct(e, product)} style={styles.editAction} title="Edit">
                            <FaEdit size={11} />
                          </button>
                          <button onClick={(e) => handleDeleteProduct(e, product.id)} style={styles.deleteAction} title="Delete">
                            <FaTrash size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={styles.cardInfo}>
                      <h3 style={styles.cardTitle}>{product.name}</h3>
                      <div style={styles.cardCategory}>
                        {categoryIcons[product.category] || <FaBolt size={10} />}
                        <span>{product.category || 'Electronics'}</span>
                      </div>
                      <div style={styles.cardRating}>
                        {renderStars(reviewData.average)}
                        <span>({reviewData.count})</span>
                      </div>
                      <div style={styles.cardFooter}>
                        <span style={styles.cardPrice}>KES {product.price?.toLocaleString()}</span>
                        <button onClick={(e) => addToCart(e, product.id)} style={styles.cardCart}>
                          <FaShoppingCart size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageDisabled : {}) }}
                >
                  ← Prev
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
                          ...(currentPage === pageNum ? styles.pageActive : {})
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
                  style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageDisabled : {}) }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerContent}>
          <FaTag style={styles.footerIcon} />
          <p style={styles.footerText}>
            © 2024 <strong>@dev.marierareagan</strong>. All rights reserved.
          </p>
          <p style={styles.footerSubtext}>
            Built with ❤️ for the tech community
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div style={styles.modalOverlay} onClick={() => setEditingProduct(null)}>
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} style={styles.modalClose}>✕</button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <input type="text" placeholder="Product Name" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required style={styles.modalInput} />
                <textarea placeholder="Description" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} rows="3" style={styles.modalTextarea} />
                <input type="number" placeholder="Price" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} required step="0.01" style={styles.modalInput} />
                <input type="text" placeholder="Category" value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} style={styles.modalInput} />
                <input type="file" accept="image/*" multiple onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setEditImages(files);
                  setEditImagePreviews(files.map(file => URL.createObjectURL(file)));
                }} style={styles.modalFile} />
                {editImagePreviews.length > 0 && (
                  <div style={styles.modalPreviews}>
                    {editImagePreviews.map((preview, idx) => (
                      <img key={idx} src={preview} alt="Preview" style={styles.modalPreview} />
                    ))}
                  </div>
                )}
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.modalSave} disabled={isSubmittingEdit}>
                    {isSubmittingEdit ? <FaSpinner style={styles.spinner} /> : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)} style={styles.modalCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;