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

  // Predefined categories from homepage
  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'Phones', label: 'Smartphones' },
    { value: 'Laptops', label: 'Laptops' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Gaming', label: 'Gaming' },
    { value: 'Cameras', label: 'Cameras' },
    { value: 'TVs', label: 'Televisions' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      showToast(`Maximum 5 images allowed. You currently have ${imagePreviews.length} images.`, 'error');
      e.target.value = '';
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      const newExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExistingImages);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImagePreviews(newPreviews);
    } else {
      const newImagesIndex = index - existingImages.length;
      const newImages = images.filter((_, i) => i !== newImagesIndex);
      setImages(newImages);
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
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.productIcon}>{isEditMode ? '✏️' : '➕'}</span>
            <span style={styles.shopIcon}>🛍️</span>
          </div>
          <h1 style={styles.title}>
            {isEditMode ? 'Edit Product' : 'Create Product'}
          </h1>
          <p style={styles.subtitle}>
            {isEditMode ? 'Update your product' : 'Add a new product to your store'}
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
              rows="3"
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
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div style={styles.imageUploadContainer}>
            <div style={styles.imageUploadHeader}>
              <span style={styles.imageCountLabel}>
                📷 Images ({imagePreviews.length}/5)
              </span>
              <button
                type="button"
                onClick={() => document.getElementById('file-upload').click()}
                style={styles.addImageButton}
                disabled={imagePreviews.length >= 5}
              >
                + Add
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
            
            {imagePreviews.length > 0 && (
              <div style={styles.imagePreviewContainer}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={styles.imagePreviewWrapper}>
                    <img src={preview} alt={`Preview ${index + 1}`} style={styles.imagePreview} />
                    <button type="button" onClick={() => removeImage(index)} style={styles.removeImageButton}>✕</button>
                    {index === 0 && <div style={styles.mainImageBadge}>Main</div>}
                  </div>
                ))}
              </div>
            )}
            
            <p style={styles.imageHelpText}>First image is main. Max 5 images.</p>
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button type="submit" disabled={isLoading} style={styles.submitButton}>
              {isLoading ? '⏳' : (isEditMode ? 'Update' : 'Create')}
            </button>
            <button type="button" onClick={() => navigate(-1)} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
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
    background: '#f5f5f5',
    padding: '60px 16px 40px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  iconContainer: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px'
  },
  productIcon: {
    fontSize: '32px',
    display: 'inline-block'
  },
  shopIcon: {
    fontSize: '32px',
    display: 'inline-block'
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '6px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#666666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  rowContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '10px',
    fontSize: '14px',
    color: '#999',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '10px 10px 10px 34px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  textarea: {
    width: '100%',
    padding: '10px 10px 10px 34px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '10px 10px 10px 34px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none'
  },
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  imageUploadHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  imageCountLabel: {
    fontSize: '12px',
    color: '#666'
  },
  addImageButton: {
    padding: '6px 14px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500'
  },
  fileInput: {
    display: 'none'
  },
  imagePreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '8px'
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '70px',
    height: '70px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: '2px',
    left: '2px',
    background: '#000000',
    color: '#ffffff',
    fontSize: '8px',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  removeImageButton: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: '#ff4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px'
  },
  imageHelpText: {
    fontSize: '10px',
    color: '#999',
    marginTop: '4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    background: '#f5f5f5',
    color: '#666666',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default ProductForm;