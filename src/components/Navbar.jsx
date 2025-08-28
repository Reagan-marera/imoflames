import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaEnvelope, FaUpload, FaShoppingCart, FaSignInAlt,
  FaUserPlus, FaUserCircle, FaMoon, FaSun, FaBars, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import { API_URL } from '../config';

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
          onHoverStart={() => setHoveringLogo(true)}
          onHoverEnd={() => setHoveringLogo(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="logo-title">
            <motion.div
              className="flammable-flame"
              animate={hoveringLogo ? {
                scale: [1, 1.1, 1],
                filter: ["drop-shadow(0 0 2px #0099ff)", "drop-shadow(0 0 6px #0099ff)", "drop-shadow(0 0 2px #0099ff)"]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.svg
                width="30"
                height="40"
                viewBox="0 0 30 40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Blue flammable flame shape */}
                <motion.path
                  d="M15 0C6.7 0 0 6.7 0 15c0 5.6 3.1 10.6 7.9 13.4l-1.4 4.2c-0.5 1.5 0.1 3.2 1.5 4.2L15 40l6.1-7.4c1.4-1 2-2.7 1.5-4.2l-1.4-4.2C26.9 25.6 30 20.6 30 15c0-8.3-6.7-15-15-15z"
                  fill="#0099ff"
                  animate={{
                    pathLength: [0.7, 1],
                    fill: ["#0099ff", "#00ccff", "#0099ff"],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                />
                <motion.path
                  d="M15 8C9.5 8 5 12.5 5 18c0 3.3 1.8 6.2 4.6 8.1l-0.8 2.4c-0.3 0.9 0.1 1.8 0.9 2.4L15 40l5.7-9.5c0.8-0.6 1.2-1.5 0.9-2.4l-0.8-2.4C20 24.2 18.2 20.7 15 18c-3.2 0-6-2.5-6-5.5s2.8-5.5 6-5.5z"
                  fill="#00ccff"
                  animate={{
                    pathLength: [0.7, 1],
                    fill: ["#00ccff", "#66ffff", "#00ccff"],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                />
                <motion.path
                  d="M15 15c-2.8 0-5.2 1.6-6.3 4.1l-0.5 1.4c-0.2 0.6 0 1.2 0.4 1.6L15 40l5.4-9.9c0.4-0.4 0.6-1 0.4-1.6l-0.5-1.4C20.2 16.6 17.8 15 15 15z"
                  fill="#66ffff"
                  animate={{
                    pathLength: [0.7, 1],
                    fill: ["#66ffff", "#00ccff", "#66ffff"],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                />
              </motion.svg>
            </motion.div>
            <span className="logo-text" style={{ color: "#0099ff" }}>ImoFlames</span>
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
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          />
          <motion.div
            className="hamburger-line"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.div
            className="hamburger-line"
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
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

// Rest of your component code remains the same
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

  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link to={path} className={`nav-link ${darkMode ? 'dark-mode' : ''} ${isActive ? 'active' : ''}`}>
        <motion.span
          className="nav-icon"
          whileHover={{ scale: 1.2 }}
          style={{ position: 'relative' }}
        >
          {icon}
          {count > 0 && (
            <span className="cart-badge">{count}</span>
          )}
        </motion.span>
        <span className="nav-label">{label}</span>
        <motion.span
          className="nav-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.li>
  );
};

const NavLinkItemMobile = ({ path, icon, label, closeMenu, darkMode, count }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <motion.li
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={path}
        onClick={() => { navigate(path); closeMenu(); }}
        className={`nav-link-mobile ${darkMode ? 'dark-mode' : ''} ${isActive ? 'active' : ''}`}
      >
        <motion.span className="nav-icon" style={{ position: 'relative' }}>
          {icon}
          {count > 0 && (
            <span className="cart-badge">{count}</span>
          )}
        </motion.span>
        <span className="nav-label">{label}</span>
        <motion.span
          className="nav-underline"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.li>
  );
};

const ProfileDropdown = ({ currentUser, handleLogout, darkMode }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className={`dropdown ${open ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}
      whileHover={{ scale: 1.05 }}
    >
      <motion.button
        onClick={() => setOpen(!open)}
        className={`dropdown-btn ${darkMode ? 'dark-mode' : ''}`}
        aria-expanded={open}
        whileTap={{ scale: 0.95 }}
      >
        <FaUserCircle className="user-icon" />
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="dropdown-list">
              <motion.li
                whileHover={{ x: 5 }}
              >
                <Link to="/profile" className={`dropdown-item ${darkMode ? 'dark-mode' : ''}`}>
                  <span className="dropdown-icon">👤</span> Profile
                </Link>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
              >
                <button onClick={handleLogout} className={`dropdown-item-btn ${darkMode ? 'dark-mode' : ''}`}>
                  <span className="dropdown-icon">🔐</span> Logout
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ThemeToggle = ({ darkMode, toggle, mobile }) => (
  <motion.button
    onClick={toggle}
    className={`theme-toggle ${mobile ? 'mobile' : ''} ${darkMode ? 'dark' : 'light'}`}
    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <motion.div
      className="theme-toggle-inner"
      animate={darkMode ? { x: mobile ? 0 : 24 } : { x: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {darkMode ? (
        <>
          <FaSun className="theme-icon" />
          {!mobile && <span className="theme-label">Light Mode</span>}
        </>
      ) : (
        <>
          <FaMoon className="theme-icon" />
          {!mobile && <span className="theme-label">Dark Mode</span>}
        </>
      )}
    </motion.div>
  </motion.button>
);

export default Navbar;
