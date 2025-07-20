import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const ProductForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [category, setCategory] = useState(''); // Add category state
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const MAX_IMAGES = 10;

  const categories = [
    'Phones',
    'TVs',
    'Laptops',
    'Heaters',
    'Gaming Consoles',
    'Accessories',
  ];

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + images.length > MAX_IMAGES) {
      showToast(`You can upload a maximum of ${MAX_IMAGES} images`, "error");
      return;
    }

    const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== selectedFiles.length) {
      showToast("Only image files are allowed", "error");
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];

    URL.revokeObjectURL(newPreviews[index]);

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Product name is required", "error");
      return;
    }
    if (!price || isNaN(parseFloat(price))) {
      showToast("Valid price is required", "error");
      return;
    }
    if (images.length === 0) {
      showToast("At least one image is required", "error");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category); // Add category to form data
    formData.append('user_id', JSON.parse(localStorage.getItem('user')).id);

    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        previews.forEach(preview => URL.revokeObjectURL(preview));
        showToast("Product uploaded successfully", "success");
        navigate('/');
      } else {
        const errorData = await res.json();
        if (errorData.reason === 'admin_approval_required') {
          showToast(
            "You do not have permission to upload products. Please contact the admin for upload permission.",
            "error"
          );
        } else {
          showToast(errorData.message || "Upload failed", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred during upload", "error");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="section-title">Upload a New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Detailed description of your product"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Images (Up to {MAX_IMAGES})</label>
            <div className="file-upload">
              <label className="btn btn-secondary">
                Select Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              <span>{images.length} image(s) selected</span>
            </div>

            <div className="image-previews">
              {previews.map((preview, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Upload Product</button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
