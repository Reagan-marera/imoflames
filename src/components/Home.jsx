// Home.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaTruck, FaShieldAlt, FaStar, FaArrowRight } from 'react-icons/fa';
import { API_URL } from '../config';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    {
      title: "Welcome to IMOFLAMES",
      subtitle: "Your Ultimate Shopping Destination",
      description: "Discover amazing products at unbeatable prices",
      icon: "🛍️",
      color: "#667eea"
    },
    {
      title: "Quality Guaranteed",
      subtitle: "Premium Products",
      description: "We ensure the highest quality standards",
      icon: "✨",
      color: "#764ba2"
    },
    {
      title: "Fast Delivery",
      subtitle: "Free Shipping on Orders",
      description: "Get your items delivered within 2-3 days",
      icon: "🚚",
      color: "#f39c12"
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/featured`);
      if (res.ok) {
        const data = await res.json();
        setFeaturedProducts(data);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundAnimation}>
        <div style={styles.particle1}>🌟</div>
        <div style={styles.particle2}>✨</div>
        <div style={styles.particle3}>💫</div>
        <div style={styles.particle4}>⭐</div>
      </div>

      {/* Hero Carousel */}
      <div style={styles.carouselContainer}>
        {carouselItems.map((item, index) => (
          <motion.div
            key={index}
            style={{
              ...styles.carouselSlide,
              background: `linear-gradient(135deg, ${item.color} 0%, #764ba2 100%)`,
              opacity: currentSlide === index ? 1 : 0,
              transform: `translateX(${(index - currentSlide) * 100}%)`
            }}
            initial={false}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.carouselContent}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                style={styles.carouselIcon}
              >
                {item.icon}
              </motion.div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={styles.carouselTitle}
              >
                {item.title}
              </motion.h1>
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={styles.carouselSubtitle}
              >
                {item.subtitle}
              </motion.h2>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={styles.carouselDescription}
              >
                {item.description}
              </motion.p>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/shop" style={styles.shopNowButton}>
                  Shop Now <FaArrowRight style={{ marginLeft: '8px' }} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
        <div style={styles.carouselDots}>
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                ...styles.carouselDot,
                background: currentSlide === index ? '#fff' : 'rgba(255,255,255,0.5)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <motion.div
            whileHover={{ y: -10 }}
            style={styles.featureCard}
          >
            <FaShoppingBag style={styles.featureIcon} />
            <h3>Wide Selection</h3>
            <p>Thousands of products to choose from</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -10 }}
            style={styles.featureCard}
          >
            <FaTruck style={styles.featureIcon} />
            <h3>Fast Delivery</h3>
            <p>Free shipping on orders over KES 5000</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -10 }}
            style={styles.featureCard}
          >
            <FaShieldAlt style={styles.featureIcon} />
            <h3>Secure Payments</h3>
            <p>100% secure payment processing</p>
          </motion.div>
        </div>
      </div>

      {/* Featured Products */}
      <div style={styles.featuredSection}>
        <h2 style={styles.sectionTitle}>Featured Products</h2>
        <div style={styles.productsGrid}>
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              style={styles.productCard}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <img
                src={`${API_URL}/api/uploads/${product.image_path}`}
                alt={product.name}
                style={styles.productImage}
              />
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>KES {product.price.toLocaleString()}</p>
                <div style={styles.productRating}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} style={{ color: '#ffc107', fontSize: '12px' }} />
                  ))}
                </div>
                <Link to={`/product/${product.id}`} style={styles.viewButton}>
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={styles.newsletterSection}>
        <div style={styles.newsletterContent}>
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest updates on new products and special offers</p>
          <form style={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              style={styles.newsletterInput}
            />
            <button type="submit" style={styles.newsletterButton}>
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    overflowX: 'hidden'
  },
  backgroundAnimation: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0
  },
  particle1: {
    position: 'absolute',
    fontSize: '40px',
    top: '10%',
    left: '10%',
    animation: 'float1 20s infinite linear',
    opacity: 0.1
  },
  particle2: {
    position: 'absolute',
    fontSize: '60px',
    bottom: '20%',
    right: '15%',
    animation: 'float2 25s infinite linear',
    opacity: 0.1
  },
  particle3: {
    position: 'absolute',
    fontSize: '50px',
    top: '50%',
    left: '80%',
    animation: 'float3 30s infinite linear',
    opacity: 0.1
  },
  particle4: {
    position: 'absolute',
    fontSize: '30px',
    bottom: '10%',
    left: '20%',
    animation: 'float4 18s infinite linear',
    opacity: 0.1
  },
  carouselContainer: {
    position: 'relative',
    height: '80vh',
    overflow: 'hidden',
    zIndex: 1
  },
  carouselSlide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.5s ease'
  },
  carouselContent: {
    textAlign: 'center',
    color: 'white',
    padding: '20px',
    maxWidth: '800px'
  },
  carouselIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    animation: 'bounce 2s infinite'
  },
  carouselTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  carouselSubtitle: {
    fontSize: '32px',
    marginBottom: '15px'
  },
  carouselDescription: {
    fontSize: '18px',
    marginBottom: '30px',
    opacity: 0.9
  },
  shopNowButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 30px',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '25px',
    fontWeight: 'bold',
    transition: 'transform 0.2s ease'
  },
  carouselDots: {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    zIndex: 2
  },
  carouselDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  featuresSection: {
    background: 'white',
    padding: '60px 20px',
    position: 'relative',
    zIndex: 1
  },
  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px'
  },
  featureCard: {
    textAlign: 'center',
    padding: '30px',
    background: '#f8f9fa',
    borderRadius: '15px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  featureIcon: {
    fontSize: '40px',
    color: '#667eea',
    marginBottom: '15px'
  },
  featuredSection: {
    background: '#f8f9fa',
    padding: '60px 20px',
    position: 'relative',
    zIndex: 1
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '36px',
    color: '#333',
    marginBottom: '40px'
  },
  productsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px'
  },
  productCard: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  productInfo: {
    padding: '20px'
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  },
  productPrice: {
    fontSize: '20px',
    color: '#667eea',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  productRating: {
    marginBottom: '15px'
  },
  viewButton: {
    display: 'inline-block',
    padding: '8px 20px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '20px',
    transition: 'background 0.2s ease'
  },
  newsletterSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '60px 20px',
    position: 'relative',
    zIndex: 1
  },
  newsletterContent: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    color: 'white'
  },
  newsletterForm: {
    display: 'flex',
    gap: '10px',
    marginTop: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  newsletterInput: {
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    outline: 'none',
    minWidth: '200px'
  },
  newsletterButton: {
    padding: '12px 30px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.2s ease'
  }
};

export default Home;