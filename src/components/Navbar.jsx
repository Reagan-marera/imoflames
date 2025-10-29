import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaEnvelope, FaUpload, FaShoppingCart, FaSignInAlt,
  FaUserPlus, FaUserCircle, FaMoon, FaSun, FaBars, FaTimes,
  FaFire, FaLaptop, FaMobile, FaHeadphones
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import { API_URL } from '../config';

// Import your logo (replace with actual path)
import imoflamesLogo from './imoflame.jpeg';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hoveringLogo, setHoveringLogo] = useState(false);
  const [showTechIcons, setShowTechIcons] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = useCallback(async () => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [location, fetchUserData]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.length);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        setCartCount(0);
      }
    };
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [location]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
    document.body.classList.add('logout-animation');
    setTimeout(() => {
      document.body.classList.remove('logout-animation');
    }, 1000);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? 'auto' : 'hidden';
  };

  return (
    <>
      <nav className={`navbar ${darkMode ? 'dark-mode' : ''} ${scrolled ? 'scrolled' : ''}`}>
        <motion.div
          className="logo-container"
          onClick={() => navigate('/')}
          onHoverStart={() => {
            setHoveringLogo(true);
            setShowTechIcons(true);
          }}
          onHoverEnd={() => {
            setHoveringLogo(false);
            setTimeout(() => setShowTechIcons(false), 1000);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-content">
            <motion.div
              className="logo-image-container"
              animate={hoveringLogo ? {
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
                filter: [
                  "drop-shadow(0 0 5px rgba(0, 153, 255, 0.5))",
                  "drop-shadow(0 0 15px rgba(0, 153, 255, 0.8))",
                  "drop-shadow(0 0 5px rgba(0, 153, 255, 0.5))"
                ]
              } : {}}
              transition={{ duration: 0.7 }}
            >
              <img 
                src={imoflamesLogo} 
                alt="ImoFlames Logo" 
                className="logo-image"
              />
              <motion.div 
                className="logo-glow"
                animate={hoveringLogo ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            
            <div className="logo-text-container">
              <span className="logo-text">ImoFlames</span>
              <motion.span 
                className="logo-slogan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Fine technology, Awesome products
              </motion.span>
            </div>
            
            <AnimatePresence>
              {showTechIcons && (
                <>
                  <motion.div
                    className="tech-icon laptop-icon"
                    initial={{ opacity: 0, x: -20, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -20, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaLaptop />
                  </motion.div>
                  <motion.div
                    className="tech-icon mobile-icon"
                    initial={{ opacity: 0, x: 20, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 20, y: -10 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <FaMobile />
                  </motion.div>
                  <motion.div
                    className="tech-icon headphone-icon"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <FaHeadphones />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        <ul className="desktop-menu">
          <DesktopNavLinks currentUser={currentUser} handleLogout={handleLogout} darkMode={darkMode} cartCount={cartCount} />
          <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} />
        </ul>
        
        <motion.button
          onClick={toggleMenu}
          className={`hamburger-button ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            className="hamburger-line"
            animate={menuOpen ? { rotate: 45, y: 7, backgroundColor: darkMode ? '#4dc4ff' : '#0099ff' } : { rotate: 0, y: 0 }}
          />
          <motion.div
            className="hamburger-line"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.div
            className="hamburger-line"
            animate={menuOpen ? { rotate: -45, y: -7, backgroundColor: darkMode ? '#4dc4ff' : '#0099ff' } : { rotate: 0, y: 0 }}
          />
        </motion.button>
      </nav>
      
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className={`mobile-menu-overlay ${darkMode ? 'dark-mode' : ''}`}
              onClick={toggleMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.ul
              className={`mobile-menu ${darkMode ? 'dark-mode' : ''}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <MobileNavLinks currentUser={currentUser} handleLogout={handleLogout} closeMenu={toggleMenu} darkMode={darkMode} cartCount={cartCount} />
              <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} mobile />
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Rest of the component code remains the same with enhanced animations...

const DesktopNavLinks = ({ currentUser, handleLogout, darkMode, cartCount }) => (
  <>
    <NavLinkItem path="/" icon={<FaHome />} label="Home" darkMode={darkMode} />
    <NavLinkItem path="/contact-us" icon={<FaEnvelope />} label="Contact" darkMode={darkMode} />
    {currentUser ? (
      <>
        <NavLinkItem path="/upload" icon={<FaUpload />} label="Upload" darkMode={darkMode} />
        <NavLinkItem path="/cart" icon={<FaShoppingCart />} label="Cart" darkMode={darkMode} count={cartCount} />
        <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} darkMode={darkMode} />
      </>
    ) : (
      <>
        <NavLinkItem path="/login" icon={<FaSignInAlt />} label="Login" darkMode={darkMode} />
        <li className="signup-link">
          <NavLinkItem path="/register" icon={<FaUserPlus />} label="Sign Up" darkMode={darkMode} />
        </li>
      </>
    )}
  </>
);

const MobileNavLinks = ({ currentUser, handleLogout, closeMenu, darkMode, cartCount }) => (
  <>
    <NavLinkItemMobile path="/" icon={<FaHome />} label="Home" closeMenu={closeMenu} darkMode={darkMode} />
    <NavLinkItemMobile path="/contact-us" icon={<FaEnvelope />} label="Contact" closeMenu={closeMenu} darkMode={darkMode} />
    {currentUser ? (
      <>
        <NavLinkItemMobile path="/upload" icon={<FaUpload />} label="Upload" closeMenu={closeMenu} darkMode={darkMode} />
        <NavLinkItemMobile path="/cart" icon={<FaShoppingCart />} label="Cart" closeMenu={closeMenu} darkMode={darkMode} count={cartCount} />
        <motion.li
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button onClick={() => { handleLogout(); closeMenu(); }} className={`logout-button ${darkMode ? 'dark-mode' : ''}`}>
            <FaSignInAlt /> Logout
          </button>
        </motion.li>
      </>
    ) : (
      <>
        <NavLinkItemMobile path="/login" icon={<FaSignInAlt />} label="Login" closeMenu={closeMenu} darkMode={darkMode} />
        <li className="signup-link-mobile">
          <NavLinkItemMobile path="/register" icon={<FaUserPlus />} label="Sign Up" closeMenu={closeMenu} darkMode={darkMode} />
        </li>
      </>
    )}
  </>
);

const NavLinkItem = ({ path, icon, label, darkMode, count }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={path} className={`nav-link ${darkMode ? 'dark-mode' : ''} ${isActive ? 'active' : ''}`}>
        <motion.span
          className="nav-icon"
          animate={isHovered ? { scale: 1.2, color: "#0099ff" } : { scale: 1, color: "inherit" }}
          style={{ position: 'relative' }}
        >
          {icon}
          {count > 0 && (
            <motion.span 
              className="cart-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {count}
            </motion.span>
          )}
        </motion.span>
        <span className="nav-label">{label}</span>
        <motion.span
          className="nav-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive || isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        {isHovered && (
          <motion.span
            className="nav-link-glow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.li>
  );
};

const NavLinkItemMobile = ({ path, icon, label, closeMenu, darkMode, count }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.li
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link
        to={path}
        onClick={() => { navigate(path); closeMenu(); }}
        className={`nav-link-mobile ${darkMode ? 'dark-mode' : ''} ${isActive ? 'active' : ''}`}
      >
        <motion.span 
          className="nav-icon"
          animate={isHovered ? { scale: 1.2, color: "#0099ff" } : { scale: 1, color: "inherit" }}
          style={{ position: 'relative' }}
        >
          {icon}
          {count > 0 && (
            <motion.span 
              className="cart-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {count}
            </motion.span>
          )}
        </motion.span>
        <span className="nav-label">{label}</span>
        <motion.span
          className="nav-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive || isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        {isHovered && (
          <motion.span
            className="nav-link-glow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.li>
  );
};

const ProfileDropdown = ({ currentUser, handleLogout, darkMode }) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`dropdown ${open ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.button
        onClick={() => setOpen(!open)}
        className={`dropdown-btn ${darkMode ? 'dark-mode' : ''}`}
        aria-expanded={open}
        whileTap={{ scale: 0.95 }}
        animate={isHovered ? { backgroundColor: darkMode ? 'rgba(77, 196, 255, 0.1)' : 'rgba(0, 153, 255, 0.1)' } : {}}
      >
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <FaUserCircle className="user-icon" />
        </motion.div>
        <span className="username">{currentUser.username}</span>
        <motion.span
          className="dropdown-arrow"
          animate={{ rotate: open ? 180 : 0 }}
        >
          ▼
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`dropdown-content ${darkMode ? 'dark-mode' : ''}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <ul className="dropdown-list">
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <Link to="/profile" className={`dropdown-item ${darkMode ? 'dark-mode' : ''}`}>
                  <motion.span 
                    className="dropdown-icon"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >👤</motion.span> Profile
                </Link>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <button onClick={handleLogout} className={`dropdown-item-btn ${darkMode ? 'dark-mode' : ''}`}>
                  <motion.span 
                    className="dropdown-icon"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >🔐</motion.span> Logout
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ThemeToggle = ({ darkMode, toggle, mobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={toggle}
      className={`theme-toggle ${mobile ? 'mobile' : ''} ${darkMode ? 'dark' : 'light'}`}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="theme-toggle-inner"
        animate={darkMode ? { x: mobile ? 0 : 24 } : { x: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {darkMode ? (
          <>
            <motion.div
              animate={isHovered ? { rotate: 180, scale: 1.2 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FaSun className="theme-icon" />
            </motion.div>
            {!mobile && <span className="theme-label">Light Mode</span>}
          </>
        ) : (
          <>
            <motion.div
              animate={isHovered ? { rotate: 180, scale: 1.2 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FaMoon className="theme-icon" />
            </motion.div>
            {!mobile && <span className="theme-label">Dark Mode</span>}
          </>
        )}
      </motion.div>
      <motion.span
        className="theme-glow"
        animate={isHovered ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.button>
  );
};

export default Navbar;