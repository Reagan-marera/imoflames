import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar,
  FaChevronLeft, FaChevronRight, FaTruck, FaShieldAlt, FaUndo,
  FaUser, FaEdit, FaTrash, FaCheck, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [floatingElements, setFloatingElements] = useState([]);
  const token = localStorage.getItem('token');

  // Create floating animation elements
  useEffect(() => {
    const elements = ['🛍️', '🛒', '📦', '💎', '✨', '🎁'];
    const newFloatingElements = [];
    for (let i = 0; i < 8; i++) {
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
    fetchProduct();
    fetchCurrentUser();
    fetchReviews();
  }, [id]);

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

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const url = `${API_URL}/api/products/${id}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Failed to load product details', 'error');
      setTimeout(() => navigate('/shop'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);

        // Check if user has already reviewed
        if (currentUser) {
          const userReview = data.find(r => r.user_id === currentUser.id);
          if (userReview) {
            setUserRating(userReview.rating);
            setReviewComment(userReview.comment || '');
          } else {
            setUserRating(0);
            setReviewComment('');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    if (!token) {
      showToast('Please login to leave a review', 'error');
      navigate('/login');
      return;
    }

    if (userRating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating,
          comment: reviewComment
        })
      });

      if (res.ok) {
        showToast('Review submitted successfully!', 'success');
        setShowReviewForm(false);
        fetchReviews();
        setUserRating(0);
        setReviewComment('');
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const updateReview = async () => {
    if (!token) {
      showToast('Please login to update review', 'error');
      return;
    }

    if (userRating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating,
          comment: reviewComment
        })
      });

      if (res.ok) {
        showToast('Review updated successfully!', 'success');
        setEditingReview(null);
        setShowReviewForm(false);
        fetchReviews();
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update review', 'error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Failed to update review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const confirmDeleteReview = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast('Review deleted successfully!', 'success');
        fetchReviews();
        setUserRating(0);
        setReviewComment('');
        setShowReviewForm(false);
        setShowDeleteConfirm(false);
        setReviewToDelete(null);
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
    }
  };

  const editReview = (review) => {
    setEditingReview(review);
    setUserRating(review.rating);
    setReviewComment(review.comment || '');
    setShowReviewForm(true);
  };

  const addToCart = async () => {
    if (!token) {
      showToast('Please login to add items to cart', 'error');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/add/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
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

  const buyNow = () => {
    if (!token) {
      showToast('Please login to purchase', 'error');
      navigate('/login');
      return;
    }

    navigate(`/order/${product.id}`, {
      state: {
        product,
        quantity,
        price: product.price,
        total: product.price * quantity
      }
    });
  };

  const nextImage = () => {
    const images = getImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = getImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getImages = () => {
    const images = [];
    if (product?.image_path) {
      images.push(`${API_URL}/uploads/${product.image_path.replace(/^\/+/, '')}`);
    }
    if (product?.extra_images) {
      const extraImages = Array.isArray(product.extra_images)
        ? product.extra_images
        : product.extra_images.split(',');
      extraImages.forEach(img => {
        if (img && img.trim()) {
          images.push(`${API_URL}/uploads/${img.replace(/^\/+/, '')}`);
        }
      });
    }
    return images;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} style={{ color: '#ffc107', fontSize: '12px' }} />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" style={{ color: '#ffc107', fontSize: '12px' }} />);
    }
    while (stars.length < 5) {
      stars.push(<FaRegStar key={stars.length} style={{ color: '#ffc107', fontSize: '12px' }} />);
    }
    return stars;
  };

  const hasUserReviewed = reviews.find(r => r.user_id === currentUser?.id);
  const images = product ? getImages() : [];
  const averageRating = calculateAverageRating();

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>Product not found</h2>
          <Link to="/shop" style={styles.backButtonLink}>Back to Shop</Link>
        </div>
      </div>
    );
  }

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
        {/* Back Button */}
        <button onClick={() => navigate('/shop')} style={styles.backButton}>
          <FaArrowLeft /> Back to Shop
        </button>

        {/* Product Detail Card */}
        <div style={styles.productCard}>
          <div style={styles.productGrid}>
            {/* Image Gallery */}
            <div style={styles.imageGallery}>
              <div style={styles.mainImageContainer}>
                {images.length > 1 && (
                  <button onClick={prevImage} style={{ ...styles.navArrow, ...styles.leftArrow }}>
                    <FaChevronLeft />
                  </button>
                )}
                <div style={styles.mainImage}>
                  <img
                    src={images[currentImageIndex] || '/placeholder-image.jpg'}
                    alt={product.name}
                    style={styles.mainImageImg}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                {images.length > 1 && (
                  <button onClick={nextImage} style={{ ...styles.navArrow, ...styles.rightArrow }}>
                    <FaChevronRight />
                  </button>
                )}
              </div>
              {images.length > 1 && (
                <div style={styles.thumbnailList}>
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        ...styles.thumbnail,
                        ...(currentImageIndex === index ? styles.activeThumbnail : {})
                      }}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} style={styles.thumbnailImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div style={styles.productInfo}>
              <h1 style={styles.productTitle}>{product.name}</h1>
              <p style={styles.productCategory}>{product.category || 'Uncategorized'}</p>

              <div style={styles.productRating}>
                <div style={styles.stars}>{renderStars(averageRating)}</div>
                <span style={styles.ratingCount}>({reviews.length} reviews)</span>
              </div>

              <div style={styles.priceSection}>
                <span style={styles.priceLabel}>Price:</span>
                <span style={styles.price}>KES {product.price ? product.price.toLocaleString() : '0'}</span>
              </div>

              <div style={styles.descriptionSection}>
                <p style={styles.description}>{product.description || 'No description available.'}</p>
              </div>

              <div style={styles.quantitySection}>
                <label style={styles.quantityLabel}>Qty:</label>
                <div style={styles.quantitySelector}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={styles.quantityButton}>-</button>
                  <span style={styles.quantityValue}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={styles.quantityButton}>+</button>
                </div>
              </div>

              <div style={styles.actionButtons}>
                <button onClick={addToCart} style={styles.addToCartButton}>
                  <FaShoppingCart /> Add to Cart
                </button>
                <button onClick={buyNow} style={styles.buyNowButton}>
                  Buy Now
                </button>
              </div>

              <div style={styles.additionalInfo}>
                <div style={styles.infoItem}><FaTruck /> Free delivery over KES 5,000</div>
                <div style={styles.infoItem}><FaShieldAlt /> Secure payment</div>
                <div style={styles.infoItem}><FaUndo /> 7-day return policy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Compact */}
        <div style={styles.reviewsSection}>
          <div style={styles.reviewsHeader}>
            <h3 style={styles.reviewsTitle}>Customer Reviews</h3>
            {!hasUserReviewed && currentUser && (
              <button onClick={() => setShowReviewForm(!showReviewForm)} style={styles.writeReviewBtn}>
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Rating Summary - Compact */}
          <div style={styles.ratingSummaryCompact}>
            <div style={styles.averageRatingCompact}>
              <span style={styles.avgNumber}>{averageRating}</span>
              <div style={styles.avgStars}>{renderStars(averageRating)}</div>
              <span style={styles.avgCount}>{reviews.length} reviews</span>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div style={styles.reviewFormCompact}>
              <div style={styles.ratingInputCompact}>
                <span>Your rating: </span>
                {[1, 2, 3, 4, 5].map(star => (
                  <FaStar
                    key={star}
                    style={{
                      ...styles.starInput,
                      color: star <= userRating ? '#ffc107' : '#e0e0e0',
                      cursor: 'pointer'
                    }}
                    onClick={() => setUserRating(star)}
                  />
                ))}
              </div>
              <textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={styles.reviewTextareaCompact}
                rows="2"
              />
              <button
                onClick={editingReview ? updateReview : submitReview}
                disabled={isSubmittingReview}
                style={styles.submitReviewBtn}
              >
                {isSubmittingReview ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          )}

          {/* Reviews List - Compact */}
          <div style={styles.reviewsListCompact}>
            {reviews.length === 0 ? (
              <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} style={styles.reviewItemCompact}>
                  <div style={styles.reviewHeaderCompact}>
                    <div style={styles.reviewerInfoCompact}>
                      <FaUser style={styles.reviewerIcon} />
                      <strong>{review.user_name}</strong>
                    </div>
                    <div style={styles.reviewRatingCompact}>{renderStars(review.rating)}</div>
                    {currentUser?.id === review.user_id && (
                      <div style={styles.reviewActionsCompact}>
                        <button onClick={() => editReview(review)} style={styles.editReviewBtn} title="Edit">
                          <FaEdit size={12} />
                        </button>
                        <button onClick={() => confirmDeleteReview(review.id)} style={styles.deleteReviewBtn} title="Delete">
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={styles.reviewCommentCompact}>{review.comment || 'No comment provided.'}</p>
                  <span style={styles.reviewDateCompact}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              style={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalIcon}>
                <FaExclamationTriangle />
              </div>
              <h3 style={styles.modalTitle}>Delete Review</h3>
              <p style={styles.modalMessage}>Are you sure you want to delete your review? This action cannot be undone.</p>
              <div style={styles.modalButtons}>
                <button onClick={() => setShowDeleteConfirm(false)} style={styles.modalCancelBtn}>
                  Cancel
                </button>
                <button onClick={deleteReview} style={styles.modalConfirmBtn}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add keyframe animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes float1 {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
          }
          @keyframes float2 {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) rotate(-360deg); opacity: 0; }
          }
          @keyframes float3 {
            0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
          }
          @keyframes float4 {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            15% { opacity: 0.7; }
            85% { opacity: 0.7; }
            100% { transform: translateY(-100vh) rotate(180deg); opacity: 0; }
          }
          @keyframes float5 {
            0% { transform: translateY(100vh) scale(1); opacity: 0; }
            25% { opacity: 0.6; }
            75% { opacity: 0.6; }
            100% { transform: translateY(-100vh) scale(0.6); opacity: 0; }
          }
          
          /* Responsive Styles */
          @media (max-width: 768px) {
            .product-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            .main-image-container {
              height: 250px !important;
            }
            .thumbnail-list {
              flex-direction: row !important;
              overflow-x: auto !important;
              max-height: none !important;
            }
            .product-title {
              font-size: 20px !important;
            }
            .price {
              font-size: 20px !important;
            }
            .action-buttons {
              flex-direction: column !important;
            }
            .reviews-section {
              padding: 15px !important;
            }
          }
          
          @media (max-width: 480px) {
            .content {
              padding: 60px 12px 30px !important;
            }
            .product-card {
              padding: 15px !important;
            }
            .main-image-container {
              height: 200px !important;
            }
            .thumbnail {
              width: 40px !important;
              height: 40px !important;
            }
            .product-title {
              font-size: 18px !important;
            }
            .price {
              font-size: 18px !important;
            }
            .description {
              font-size: 12px !important;
            }
            .quantity-button {
              width: 24px !important;
              height: 24px !important;
            }
            .add-to-cart-button, .buy-now-button {
              padding: 10px !important;
              font-size: 12px !important;
            }
            .info-item {
              font-size: 9px !important;
            }
            .reviews-title {
              font-size: 16px !important;
            }
            .write-review-btn {
              padding: 4px 10px !important;
              font-size: 11px !important;
            }
            .avg-number {
              font-size: 24px !important;
            }
            .review-item-compact {
              padding: 10px !important;
            }
            .review-header-compact {
              gap: 8px !important;
            }
            .modal-content {
              padding: 20px !important;
              margin: 0 16px !important;
            }
          }
          
          /* Touch-friendly improvements */
          @media (hover: none) and (pointer: coarse) {
            button, .thumbnail {
              min-height: 44px;
            }
            .quantity-button {
              min-height: 36px;
              min-width: 36px;
            }
            .add-to-cart-button, .buy-now-button {
              padding: 12px !important;
            }
          }
          
          /* Smooth scrolling */
          .reviews-list-compact {
            scrollbar-width: thin;
          }
          .reviews-list-compact::-webkit-scrollbar {
            width: 4px;
          }
          .reviews-list-compact::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .reviews-list-compact::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          .thumbnail-list::-webkit-scrollbar {
            height: 4px;
          }
          .thumbnail-list::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .thumbnail-list::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
        `
      }} />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  backgroundElements: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    top: 0,
    left: 0
  },
  floatingElement: {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    bottom: '-100px'
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 20px 40px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#333'
  },
  backButtonLink: {
    display: 'inline-flex',
    padding: '8px 16px',
    background: 'white',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '8px'
  },
  productCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px'
  },
  imageGallery: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  mainImageContainer: {
    position: 'relative',
    height: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  mainImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainImageImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftArrow: { left: '10px' },
  rightArrow: { right: '10px' },
  thumbnailList: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  thumbnail: {
    width: '50px',
    height: '50px',
    borderRadius: '6px',
    border: '2px solid transparent',
    cursor: 'pointer',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'none',
    padding: 0
  },
  activeThumbnail: { borderColor: '#667eea' },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  productTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  productCategory: {
    fontSize: '12px',
    color: '#999',
    margin: 0
  },
  productRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  stars: {
    display: 'flex',
    gap: '3px'
  },
  ratingCount: {
    fontSize: '11px',
    color: '#999'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    padding: '10px 0',
    borderTop: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    flexWrap: 'wrap'
  },
  priceLabel: { fontSize: '14px', color: '#666' },
  price: { fontSize: '22px', fontWeight: 'bold', color: '#667eea' },
  descriptionSection: { marginTop: '5px' },
  description: { fontSize: '13.5px', lineHeight: '1.5', color: '#413f3f', margin: 0 },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '5px',
    flexWrap: 'wrap'
  },
  quantityLabel: { fontSize: '13px', fontWeight: '500' },
  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  quantityButton: {
    width: '28px',
    height: '28px',
    background: '#f5f5f5',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityValue: { width: '35px', textAlign: 'center', fontSize: '13px' },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexDirection: 'row'
  },
  addToCartButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  buyNowButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  additionalInfo: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    color: '#666'
  },
  reviewsSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  reviewsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  writeReviewBtn: {
    padding: '6px 12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  ratingSummaryCompact: {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e0e0'
  },
  averageRatingCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  avgNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#667eea'
  },
  avgStars: { display: 'flex', gap: '2px' },
  avgCount: { fontSize: '12px', color: '#999' },
  reviewFormCompact: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '15px'
  },
  ratingInputCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  starInput: { fontSize: '18px', transition: 'color 0.2s' },
  reviewTextareaCompact: {
    width: '100%',
    padding: '8px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'inherit',
    marginBottom: '10px',
    boxSizing: 'border-box'
  },
  submitReviewBtn: {
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  reviewsListCompact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  reviewItemCompact: {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  reviewHeaderCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  reviewerInfoCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  reviewerIcon: { color: '#667eea', fontSize: '12px' },
  reviewRatingCompact: { display: 'flex', gap: '2px' },
  reviewActionsCompact: {
    display: 'flex',
    gap: '6px',
    marginLeft: 'auto'
  },
  editReviewBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  deleteReviewBtn: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  reviewCommentCompact: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '6px',
    wordBreak: 'break-word'
  },
  reviewDateCompact: {
    fontSize: '10px',
    color: '#999',
    display: 'block'
  },
  noReviews: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
    fontSize: '12px'
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
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  modalIcon: {
    fontSize: '48px',
    color: '#ffc107',
    marginBottom: '15px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  modalMessage: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  modalCancelBtn: {
    flex: 1,
    padding: '10px',
    background: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '100px'
  },
  modalConfirmBtn: {
    flex: 1,
    padding: '10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '100px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'white'
  },
  loadingSpinner: {
    fontSize: '40px',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '15px',
    maxWidth: '400px',
    margin: '100px auto',
    boxSizing: 'border-box'
  }
};

// Add responsive styles to the component
const responsiveStyles = `
  @media (max-width: 768px) {
    .product-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .action-buttons {
      flex-direction: column !important;
    }
  }
`;

export default ProductDetail;