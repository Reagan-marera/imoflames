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
      if (product.image_path) {
        previews.push(`${API_URL}/api/uploads/${product.image_path}`);
      }
      if (product.extra_images) {
        const extraImages = Array.isArray(product.extra_images)
          ? product.extra_images
          : product.extra_images.split(',');
        previews.push(...extraImages.map((img) => `${API_URL}/api/uploads/${img}`));
      }
      setImagePreviews(previews);
    }
  }, [product, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Name and price are required', 'error');
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
        showToast(`Product ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
        const newProduct = resultData.product || resultData;
        const productId = newProduct.id;
        navigate(`/product/${productId}`);
      } else {
        showToast(resultData.message || `Failed to ${isEditMode ? 'update' : 'create'} product`, 'error');
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, err);
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} product`, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#0d1117', color: '#e0e0e0', minHeight: '100vh' }}>
      <h2>{isEditMode ? 'Edit Product' : 'Create Product'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
        </div>
        <div>
          <label>Price</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} />
        </div>
        <div>
          <label>Category</label>
          <input type="text" name="category" value={formData.category} onChange={handleChange} />
        </div>
        <div>
          <label>Images</label>
          <input type="file" multiple onChange={handleImageChange} />
          <div>
            {imagePreviews.map((preview, index) => (
              <img key={index} src={preview} alt="Product Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
            ))}
          </div>
        </div>
        <button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : (isEditMode ? 'Update Product' : 'Create Product')}</button>
      </form>
    </div>
  );
};

export default ProductForm;
