// Home.jsx - Simplified with only Featured Products
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaShoppingBag, FaTruck, FaShieldAlt, FaStar, FaArrowRight, 
  FaLaptop, FaMobileAlt, FaHeadphones, FaGamepad, FaCamera, 
  FaTv, FaMicrochip, FaGem
} from 'react-icons/fa';
import { API_URL } from '../config';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: "Phones", icon: <FaMobileAlt size={20} />, image: "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Laptops", icon: <FaLaptop size={20} />, image: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Audio", icon: <FaHeadphones size={20} />, image: "https://images.pexels.com/photos/164837/pexels-photo-164837.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Gaming", icon: <FaGamepad size={20} />, image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Cameras", icon: <FaCamera size={20} />, image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "TVs", icon: <FaTv size={20} />, image: "https://images.pexels.com/photos/127151/pexels-photo-127151.jpeg?auto=compress&cs=tinysrgb&w=400" }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/products/featured`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(Array.isArray(data) ? data : []);
      } else {
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>Loading amazing products...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.logoIcon}>
            <FaMicrochip size={48} />
          </div>
          <h1 style={styles.heroTitle}>
            Welcome to <span style={styles.italicText}>IMOFLAMES</span>
          </h1>
          <p style={styles.heroDescription}>
            Your premier destination for cutting-edge electronics and premium gadgets.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/shop" style={styles.primaryButton}>
              Shop Now <FaArrowRight style={{ marginLeft: '8px' }} size={14} />
            </Link>
            <Link to="/contact-us" style={styles.secondaryButton}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <FaShoppingBag size={20} />
            <span>Wide Selection</span>
          </div>
          <div style={styles.featureCard}>
            <FaTruck size={20} />
            <span>Fast Delivery</span>
          </div>
          <div style={styles.featureCard}>
            <FaShieldAlt size={20} />
            <span>Secure Payments</span>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div style={styles.categoriesSection}>
        <h2 style={styles.sectionTitle}>Shop by <span style={styles.italicText}>Category</span></h2>
        <div style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <Link key={index} to={`/shop?category=${category.name}`} style={styles.categoryCard}>
              <div style={styles.categoryImage}>
                <img src={category.image} alt={category.name} style={styles.categoryImg} />
              </div>
              <div style={styles.categoryIcon}>
                {category.icon}
              </div>
              <span style={styles.categoryName}>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Seller Section */}
      <div style={styles.sellerSection}>
        <div style={styles.sellerContent}>
          <h2 style={styles.sellerTitle}>Sell with <span style={styles.italicTextWhite}>Us</span></h2>
          <p style={styles.sellerText}>Reach thousands of customers</p>
          <Link to="/contact-us" style={styles.sellerButton}>
            Contact Admin <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Featured Products Section - After Seller Section */}
      {featuredProducts.length > 0 && (
        <div style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleWrapper}>
              <FaGem size={20} style={{ marginRight: '8px' }} />
              <h2 style={styles.sectionTitle}>Featured Products</h2>
            </div>
            <Link to="/shop" style={styles.viewAllLink}>
              View All <FaArrowRight size={12} />
            </Link>
          </div>
          <div style={styles.productsGrid}>
            {featuredProducts.slice(0, 6).map((product) => (
              <motion.div
                key={product.id}
                style={styles.productCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/product/${product.id}`} style={styles.productLink}>
                  <div style={styles.productImageContainer}>
                    <img
                      src={product.image_path ? `${API_URL}/uploads/${product.image_path.replace(/^\/+/, '')}` : '/placeholder-image.jpg'}
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productCategory}>{product.category || 'Electronics'}</p>
                    <p style={styles.productPrice}>KES {product.price?.toLocaleString()}</p>
                    <div style={styles.productRating}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} size={10} color="#fbbf24" />
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px'
  },
  loadingSpinner: {
    fontSize: '40px',
    animation: 'spin 1s linear infinite'
  },
  heroSection: {
    padding: '60px 20px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eaeaea'
  },
  heroContent: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center'
  },
  logoIcon: {
    marginBottom: '16px',
    color: '#000000'
  },
  heroTitle: {
    fontSize: 'clamp(28px, 6vw, 42px)',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#000000'
  },
  italicText: {
    fontStyle: 'italic',
    fontWeight: '600'
  },
  italicTextWhite: {
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#ffffff'
  },
  heroDescription: {
    fontSize: 'clamp(14px, 4vw, 16px)',
    lineHeight: '1.5',
    marginBottom: '24px',
    color: '#555'
  },
  heroButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '14px'
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 24px',
    backgroundColor: 'transparent',
    color: '#000000',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '14px',
    border: '1px solid #000000'
  },
  featuresSection: {
    padding: '24px 20px',
    backgroundColor: '#f8f8f8',
    borderBottom: '1px solid #eaeaea'
  },
  featuresGrid: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  featureCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '500'
  },
  categoriesSection: {
    padding: '40px 20px',
    backgroundColor: '#f8f8f8'
  },
  sectionTitle: {
    fontSize: 'clamp(20px, 5vw, 28px)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '24px',
    color: '#000000'
  },
  categoriesGrid: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px'
  },
  categoryCard: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  },
  categoryImage: {
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  categoryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  categoryIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#000000',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '-16px auto 8px',
    position: 'relative',
    zIndex: 2
  },
  categoryName: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#000000',
    display: 'block'
  },
  sellerSection: {
    padding: '40px 20px',
    backgroundColor: '#000000'
  },
  sellerContent: {
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center'
  },
  sellerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#ffffff'
  },
  sellerText: {
    fontSize: '14px',
    marginBottom: '20px',
    color: '#aaaaaa'
  },
  sellerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#ffffff',
    color: '#000000',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '13px'
  },
  featuredSection: {
    padding: '40px 20px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #eaeaea'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    maxWidth: '1200px',
    margin: '0 auto 24px',
    padding: '0 16px'
  },
  sectionTitleWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#666',
    textDecoration: 'none',
    fontSize: '13px'
  },
  productsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    padding: '0 16px'
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #eaeaea',
    transition: 'all 0.2s ease'
  },
  productLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  productImageContainer: {
    height: '160px',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productInfo: {
    padding: '12px'
  },
  productName: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#000000',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  productCategory: {
    fontSize: '10px',
    color: '#999',
    marginBottom: '6px'
  },
  productPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#000000',
    marginBottom: '6px'
  },
  productRating: {
    display: 'flex',
    gap: '3px'
  }
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Home;