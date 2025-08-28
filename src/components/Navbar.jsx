import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaEnvelope, FaUpload, FaShoppingCart, FaSignInAlt, 
  FaUserPlus, FaUserCircle, FaMoon, FaSun, FaBars, FaTimes, FaFire
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
              animate={{ rotate: hoveringLogo ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaFire className="logo-icon" />
            </motion.div>
            <span className="logo-text">ImoFlames</span>
            <div className="logo-flames">
              <motion.div 
                className="flame"
                animate={{
                  opacity: [0.8, 1, 0.8],
                  height: ['8px', '12px', '8px']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
              <motion.div 
                className="flame"
                animate={{
                  opacity: [0.7, 1, 0.7],
                  height: ['6px', '10px', '6px']
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: 0.3
                }}
              />
              <motion.div 
                className="flame"
                animate={{
                  opacity: [0.6, 0.9, 0.6],
                  height: ['4px', '8px', '4px']
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: 0.6
                }}
              />
            </div>
          </div>
        </motion.div>

        <ul className="desktop-menu">
          <DesktopNavLinks currentUser={currentUser} handleLogout={handleLogout} darkMode={darkMode} />
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
              <MobileNavLinks currentUser={currentUser} handleLogout={handleLogout} closeMenu={toggleMenu} darkMode={darkMode} />
              <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} mobile />
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const DesktopNavLinks = ({ currentUser, handleLogout, darkMode }) => (
  <>
    <NavLinkItem path="/" icon={<FaHome />} label="Home" darkMode={darkMode} />
    <NavLinkItem path="/contact-us" icon={<FaEnvelope />} label="Contact" darkMode={darkMode} />
    {currentUser ? (
      <>
        <NavLinkItem path="/upload" icon={<FaUpload />} label="Upload" darkMode={darkMode} />
        <NavLinkItem path="/cart" icon={<FaShoppingCart />} label="Cart" darkMode={darkMode} />
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

const MobileNavLinks = ({ currentUser, handleLogout, closeMenu, darkMode }) => (
  <>
    <NavLinkItemMobile path="/" icon={<FaHome />} label="Home" closeMenu={closeMenu} darkMode={darkMode} />
    <NavLinkItemMobile path="/contact-us" icon={<FaEnvelope />} label="Contact" closeMenu={closeMenu} darkMode={darkMode} />
    {currentUser ? (
      <>
        <NavLinkItemMobile path="/upload" icon={<FaUpload />} label="Upload" closeMenu={closeMenu} darkMode={darkMode} />
        <NavLinkItemMobile path="/cart" icon={<FaShoppingCart />} label="Cart" closeMenu={closeMenu} darkMode={darkMode} />
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

const NavLinkItem = ({ path, icon, label, darkMode }) => {
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
        >
          {icon}
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

const NavLinkItemMobile = ({ path, icon, label, closeMenu, darkMode }) => {
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
        <motion.span className="nav-icon">{icon}</motion.span>
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