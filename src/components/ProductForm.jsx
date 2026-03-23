import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config';
import { showToast } from './utils';

const ProductForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { product } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Track existing images from backend
  const [imagePreviews, setImagePreviews] = useState([]);
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        category: product.category || '',
      });
      
      const previews = [];
      const existing = [];
      
      if (product.image_path) {
        const imgUrl = `${API_URL}/uploads/${product.image_path.replace(/^\/+/, '')}`;
        previews.push(imgUrl);
        existing.push({ url: imgUrl, path: product.image_path, isMain: true });
      }
      
      if (product.extra_images) {
        const extraImages = Array.isArray(product.extra_images)
          ? product.extra_images
          : product.extra_images.split(',');
        extraImages.forEach(img => {
          if (img && img.trim()) {
            const imgUrl = `${API_URL}/uploads/${img.replace(/^\/+/, '')}`;
            previews.push(imgUrl);
            existing.push({ url: imgUrl, path: img, isMain: false });
          }
        });
      }
      
      setExistingImages(existing);
      setImagePreviews(previews);
    }
  }, [product, isEditMode]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // FIXED: Append new images instead of replacing
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      showToast(`Maximum 5 images allowed. You currently have ${imagePreviews.length} images.`, 'error');
      e.target.value = ''; // Clear input
      return;
    }
    
    // Append new files to existing images array
    setImages(prev => [...prev, ...files]);
    
    // Create previews for new files and append to existing previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (index) => {
    // Check if this is an existing image or a new image
    if (index < existingImages.length) {
      // Remove existing image
      const newExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExistingImages);
      // Also remove from previews
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
    } else {
      // Remove new image that hasn't been uploaded yet
      const newImagesIndex = index - existingImages.length;
      const newImages = images.filter((_, i) => i !== newImagesIndex);
      setImages(newImages);
      // Remove from previews
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Name and price are required', 'error');
      return;
    }
    
    // Check if there's at least one image
    if (imagePreviews.length === 0) {
      showToast('Please add at least one image', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      
      // Send new images
      images.forEach((file) => {
        data.append('images', file);
      });

      const url = isEditMode ? `${API_URL}/api/products/${id}` : `${API_URL}/api/products`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const resultData = await res.json();

      if (res.ok) {
        showToast(`Product ${isEditMode ? 'updated' : 'created'} successfully! 🎉`, 'success');
        const newProduct = resultData.product || resultData;
        const productId = newProduct.id;
        setTimeout(() => navigate(`/product/${productId}`), 1500);
      } else {
        if (res.status === 401) {
          showToast('Session expired. Please login again.', 'error');
          navigate('/login');
        } else {
          showToast(resultData.message || `Failed to ${isEditMode ? 'update' : 'create'} product`, 'error');
        }
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, err);
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} product`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Main Card */}
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.productIcon}>{isEditMode ? '✏️' : '➕'}</span>
            <span style={styles.shopIcon}>🛍️</span>
          </div>
          <h1 style={styles.title}>
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p style={styles.subtitle}>
            {isEditMode 
              ? 'Update your product information' 
              : 'Add a new product to your store'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Product Name */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>🏷️</div>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>📝</div>
            <textarea
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={styles.textarea}
            />
          </div>

          {/* Price and Category Row */}
          <div style={styles.rowContainer}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <div style={styles.inputIcon}>💰</div>
              <input
                type="number"
                name="price"
                placeholder="Price (KES)"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <div style={styles.inputIcon}>📂</div>
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Image Upload - Multiple images with add button */}
          <div style={styles.imageUploadContainer}>
            <div style={styles.imageUploadHeader}>
              <div style={styles.inputIcon}>🖼️</div>
              <span style={styles.imageCountLabel}>
                Images ({imagePreviews.length}/5)
              </span>
              <button
                type="button"
                onClick={() => document.getElementById('file-upload').click()}
                style={styles.addImageButton}
                disabled={imagePreviews.length >= 5}
              >
                + Add Image
              </button>
            </div>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
              id="file-upload"
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div style={styles.imagePreviewContainer}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={styles.imagePreviewWrapper}>
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      style={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={styles.removeImageButton}
                    >
                      ✕
                    </button>
                    {index === 0 && (
                      <div style={styles.mainImageBadge}>Main</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <p style={styles.imageHelpText}>
              First image will be the main product image. Maximum 5 images.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
          >
            {isLoading ? (
              <span style={styles.loadingSpinner}>⏳</span>
            ) : (
              <>
                <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                <span style={styles.buttonIcon}>→</span>
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
        </form>

        {/* Help Text */}
        <div style={styles.helpText}>
          <span>💡 Tip: Add clear, high-quality images to attract more buyers</span>
        </div>
      </div>

      {/* Success Message Animation */}
      <div style={styles.welcomeMessage}>
        <span>✨ {isEditMode ? 'Update your product' : 'Share your product with the world'} ✨</span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: "'Poppins', 'Segoe UI', 'Roboto', sans-serif"
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
  card: {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '650px',
    position: 'relative',
    zIndex: 1,
    animation: 'slideUp 0.5s ease-out',
    transition: 'transform 0.3s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  iconContainer: {
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },
  productIcon: {
    fontSize: '40px',
    display: 'inline-block',
    animation: 'bounce 1s infinite'
  },
  shopIcon: {
    fontSize: '40px',
    display: 'inline-block',
    animation: 'wave 1s infinite 0.2s'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rowContainer: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '18px',
    color: '#999',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px'
  },
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  imageUploadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative'
  },
  imageCountLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  addImageButton: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  fileInput: {
    display: 'none'
  },
  imagePreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '10px'
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e0e0e0'
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    background: 'rgba(102, 126, 234, 0.9)',
    color: 'white',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  removeImageButton: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    transition: 'transform 0.2s ease',
    zIndex: 2
  },
  imageHelpText: {
    fontSize: '11px',
    color: '#999',
    marginTop: '5px'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  cancelButton: {
    background: 'white',
    color: '#666',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  buttonIcon: {
    fontSize: '18px',
    transition: 'transform 0.2s ease'
  },
  loadingSpinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite'
  },
  helpText: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    fontSize: '12px',
    color: '#999',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  welcomeMessage: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(255,255,255,0.95)',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#667eea',
    animation: 'slideInRight 0.5s ease-out',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000
  }
};

// Add CSS animations to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(50px, 30px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes float2 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-40px, 20px) rotate(-180deg); }
    100% { transform: translate(0, 0) rotate(-360deg); }
  }
  @keyframes float3 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-30px, -40px) rotate(90deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes float4 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(60px, -20px) rotate(-90deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes float5 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-50px, -30px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  input:focus, textarea:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
  .remove-image-button:hover {
    transform: scale(1.1);
  }
  @media (max-width: 768px) {
    .product-form-card {
      padding: 25px;
    }
    .product-form-title {
      font-size: 24px;
    }
    .row-container {
      flex-direction: column;
      gap: 20px;
    }
  }
  @media (max-width: 480px) {
    .image-preview-container {
      justify-content: center;
    }
    .help-text {
      font-size: 10px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ProductForm;