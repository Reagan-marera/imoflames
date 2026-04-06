import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaEnvelope, FaUpload, FaShoppingCart, FaSignInAlt,
  FaUserPlus, FaUserCircle, FaMoon, FaSun, FaBars, FaTimes,
  FaStore, FaTag, FaBell, FaCrown, FaClipboardList, FaMicrochip
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import { API_URL } from '../config';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hoveringLogo, setHoveringLogo] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = useCallback(async () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);
      
      // Fetch fresh user data from backend to check permissions
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const freshUser = await res.json();
          setCurrentUser(prev => ({ ...prev, ...freshUser }));
          localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...freshUser }));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [location, fetchUserData]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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

  // Auto-retract dropdown after 5 seconds
  useEffect(() => {
    if (dropdownOpen) {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      dropdownTimeoutRef.current = setTimeout(() => {
        setDropdownOpen(false);
      }, 5000);
    }
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, [dropdownOpen]);

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
    setDropdownOpen(false);
    navigate('/');
    showToast('Logged out successfully! 👋', 'success');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? 'auto' : 'hidden';
  };

  const showToast = (message, type) => {
    const toastEvent = new CustomEvent('showToast', { detail: { message, type } });
    window.dispatchEvent(toastEvent);
  };

  const canUpload = () => {
    return currentUser?.can_upload === true || currentUser?.is_admin === true;
  };

  return (
    <>
      <nav className={`navbar ${darkMode ? 'dark-mode' : ''} ${scrolled ? 'scrolled' : ''}`}>
        <motion.div
          className="logo-container"
          onClick={() => navigate('/')}
          onHoverStart={() => setHoveringLogo(true)}
          onHoverEnd={() => setHoveringLogo(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="logo-wrapper">
            <div className="logo-icon">
              <FaMicrochip className="chip-icon" />
            </div>
            <div className="logo-text-wrapper">
              <motion.span 
                className="logo-text"
                animate={hoveringLogo ? {
                  letterSpacing: ['normal', '1px', 'normal']
                } : {}}
                transition={{ duration: 0.3 }}
              >
                ImoFlames
              </motion.span>
              <motion.span 
                className="logo-slogan"
                animate={hoveringLogo ? {
                  opacity: [0.8, 1, 0.8]
                } : {}}
                transition={{ duration: 0.3 }}
              >
                Fine Technology, Awesome Products
              </motion.span>
            </div>
          </div>
        </motion.div>

        <ul className="desktop-menu">
          <DesktopNavLinks 
            currentUser={currentUser} 
            handleLogout={handleLogout} 
            darkMode={darkMode} 
            cartCount={cartCount}
            canUpload={canUpload()}
          />
          <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} />
        </ul>

        <motion.button
          onClick={toggleMenu}
          className={`hamburger-button ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
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
              transition={{ duration: 0.2 }}
            />
            <motion.ul
              className={`mobile-menu ${darkMode ? 'dark-mode' : ''}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <MobileNavLinks 
                currentUser={currentUser} 
                handleLogout={handleLogout} 
                closeMenu={toggleMenu} 
                darkMode={darkMode} 
                cartCount={cartCount}
                canUpload={canUpload()}
              />
              <div className="mobile-theme-wrapper">
                <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} mobile />
              </div>
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const DesktopNavLinks = ({ currentUser, handleLogout, darkMode, cartCount, canUpload }) => (
  <>
    <NavLinkItem path="/" icon={<FaHome />} label="Home" darkMode={darkMode} />
    <NavLinkItem path="/shop" icon={<FaStore />} label="Shop" darkMode={darkMode} />
    <NavLinkItem path="/contact-us" icon={<FaEnvelope />} label="Contact" darkMode={darkMode} />
    {currentUser ? (
      <>
        {canUpload && (
          <NavLinkItem path="/upload" icon={<FaUpload />} label="Sell" darkMode={darkMode} highlight />
        )}
        <NavLinkItem path="/cart" icon={<FaShoppingCart />} label="Cart" darkMode={darkMode} count={cartCount} />
        <NavLinkItem path="/orders" icon={<FaClipboardList />} label="Orders" darkMode={darkMode} />
        <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} darkMode={darkMode} />
      </>
    ) : (
      <>
        <NavLinkItem path="/login" icon={<FaSignInAlt />} label="Login" darkMode={darkMode} />
        <NavLinkItem path="/register" icon={<FaUserPlus />} label="Sign Up" darkMode={darkMode} highlight />
      </>
    )}
  </>
);

const MobileNavLinks = ({ currentUser, handleLogout, closeMenu, darkMode, cartCount, canUpload }) => (
  <>
    <NavLinkItemMobile path="/" icon={<FaHome />} label="Home" closeMenu={closeMenu} darkMode={darkMode} />
    <NavLinkItemMobile path="/shop" icon={<FaStore />} label="Shop" closeMenu={closeMenu} darkMode={darkMode} />
    <NavLinkItemMobile path="/contact-us" icon={<FaEnvelope />} label="Contact" closeMenu={closeMenu} darkMode={darkMode} />
    {currentUser ? (
      <>
        {canUpload && (
          <NavLinkItemMobile path="/upload" icon={<FaUpload />} label="Sell" closeMenu={closeMenu} darkMode={darkMode} highlight />
        )}
        <NavLinkItemMobile path="/cart" icon={<FaShoppingCart />} label="Cart" closeMenu={closeMenu} darkMode={darkMode} count={cartCount} />
        <NavLinkItemMobile path="/orders" icon={<FaClipboardList />} label="Orders" closeMenu={closeMenu} darkMode={darkMode} />
        <motion.li
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button onClick={() => { handleLogout(); closeMenu(); }} className={`logout-button ${darkMode ? 'dark-mode' : ''}`}>
            <FaSignInAlt /> Logout
          </button>
        </motion.li>
      </>
    ) : (
      <>
        <NavLinkItemMobile path="/login" icon={<FaSignInAlt />} label="Login" closeMenu={closeMenu} darkMode={darkMode} />
        <NavLinkItemMobile path="/register" icon={<FaUserPlus />} label="Sign Up" closeMenu={closeMenu} darkMode={darkMode} highlight />
      </>
    )}
  </>
);

const NavLinkItem = ({ path, icon, label, darkMode, count, highlight }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <motion.li
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={path} className={`nav-link ${darkMode ? 'dark-mode' : ''} ${isActive ? 'active' : ''} ${highlight ? 'highlight' : ''}`}>
        <motion.span
          className="nav-icon"
          whileHover={{ scale: 1.1 }}
          style={{ position: 'relative' }}
        >
          {icon}
          {count > 0 && (
            <motion.span 
              className="cart-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              {count}
            </motion.span>
          )}
        </motion.span>
        <span className="nav-label">{label}</span>
        {isActive && (
          <motion.div
            className="nav-indicator"
            layoutId="navIndicator"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </motion.li>
  );
};

const NavLinkItemMobile = ({ path, icon, label, closeMenu, darkMode, count, highlight }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <motion.li
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={path}
        onClick={() => { navigate(path); closeMenu(); }}
        className={`nav-link-mobile ${darkMode ? 'dark-mode' : ''} ${isActive ? 'active' : ''} ${highlight ? 'highlight' : ''}`}
      >
        <motion.span className="nav-icon" style={{ position: 'relative' }}>
          {icon}
          {count > 0 && (
            <span className="cart-badge">{count}</span>
          )}
        </motion.span>
        <span className="nav-label">{label}</span>
      </Link>
    </motion.li>
  );
};

const ProfileDropdown = ({ currentUser, handleLogout, darkMode }) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <motion.div
      className={`dropdown ${open ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        className={`dropdown-btn ${darkMode ? 'dark-mode' : ''}`}
        aria-expanded={open}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaUserCircle className="user-icon" />
        <span className="username">{currentUser.username}</span>
        <motion.span
          className="dropdown-arrow"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`dropdown-content ${darkMode ? 'dark-mode' : ''}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="dropdown-list">
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.1 }}
              >
                <Link to="/profile" className={`dropdown-item ${darkMode ? 'dark-mode' : ''}`}>
                  <span className="dropdown-icon">👤</span> My Profile
                </Link>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.1 }}
              >
              
              </motion.li>
              {currentUser.is_admin && (
                <motion.li
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.1 }}
                >
                  <Link to="/user-management" className={`dropdown-item ${darkMode ? 'dark-mode' : ''}`}>
                    <span className="dropdown-icon">⚙️</span> Admin Panel
                  </Link>
                </motion.li>
              )}
              {currentUser.can_upload && !currentUser.is_admin && (
                <motion.li
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.1 }}
                >
                  <Link to="/my-products" className={`dropdown-item ${darkMode ? 'dark-mode' : ''}`}>
                    <span className="dropdown-icon">📦</span> My Products
                  </Link>
                </motion.li>
              )}
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.1 }}
              >
                <button onClick={handleLogout} className={`dropdown-item-btn ${darkMode ? 'dark-mode' : ''}`}>
                  <span className="dropdown-icon">🚪</span> Logout
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
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.div
      className="theme-toggle-inner"
      animate={darkMode ? { rotate: 0 } : { rotate: 0 }}
      transition={{ duration: 0.3 }}
    >
      {darkMode ? (
        <>
          <FaSun className="theme-icon" />
          {!mobile && <span className="theme-label">Light</span>}
        </>
      ) : (
        <>
          <FaMoon className="theme-icon" />
          {!mobile && <span className="theme-label">Dark</span>}
        </>
      )}
    </motion.div>
  </motion.button>
);

export default Navbar;