import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaBox, FaEnvelope, FaUpload, FaShoppingCart, FaSignInAlt, FaUserPlus, FaUserCircle, FaMoon, FaSun, FaBars, FaTimes,
} from 'react-icons/fa';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`}>
        <div className="logo-container">
          <h1
            className="logo-title"
            onClick={() => navigate('/')}
          >
            🔥 ImoFlames
          </h1>
        </div>

        <ul className="desktop-menu">
          <DesktopNavLinks currentUser={currentUser} handleLogout={handleLogout} />
          <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} />
        </ul>

        <button onClick={toggleMenu} className="hamburger-button">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      <ul className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <MobileNavLinks currentUser={currentUser} handleLogout={handleLogout} closeMenu={() => setMenuOpen(false)} />
        <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} mobile />
      </ul>

    </>
  );
};

const DesktopNavLinks = ({ currentUser, handleLogout }) => (
  <>
    <li><NavLink path="/" icon={<FaHome />} label="Home" /></li>
    <li><NavLink path="/products" icon={<FaBox />} label="Products" /></li>
    <li><NavLink path="/contact-us" icon={<FaEnvelope />} label="Contact Us" /></li>
    {currentUser ? (
      <>
        <li><NavLink path="/upload" icon={<FaUpload />} label="Upload" /></li>
        <li><NavLink path="/cart" icon={<FaShoppingCart />} label="Cart" /></li>
        <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} />
      </>
    ) : (
      <>
        <li><NavLink path="/login" icon={<FaSignInAlt />} label="Login" /></li>
        <li><NavLink path="/register" icon={<FaUserPlus />} label="Sign Up" /></li>
      </>
    )}
  </>
);

const MobileNavLinks = ({ currentUser, handleLogout, closeMenu }) => (
  <>
    <li><NavLinkMobile path="/" icon={<FaHome />} label="Home" closeMenu={closeMenu} /></li>
    <li><NavLinkMobile path="/products" icon={<FaBox />} label="Products" closeMenu={closeMenu} /></li>
    <li><NavLinkMobile path="/contact-us" icon={<FaEnvelope />} label="Contact Us" closeMenu={closeMenu} /></li>
    {currentUser ? (
      <>
        <li><NavLinkMobile path="/upload" icon={<FaUpload />} label="Upload" closeMenu={closeMenu} /></li>
        <li><NavLinkMobile path="/cart" icon={<FaShoppingCart />} label="Cart" closeMenu={closeMenu} /></li>
        <li>
          <button onClick={handleLogout} className="logout-button">
            <FaSignInAlt /> Logout
          </button>
        </li>
      </>
    ) : (
      <>
        <li><NavLinkMobile path="/login" icon={<FaSignInAlt />} label="Login" closeMenu={closeMenu} /></li>
        <li><NavLinkMobile path="/register" icon={<FaUserPlus />} label="Sign Up" closeMenu={closeMenu} /></li>
      </>
    )}
  </>
);

const NavLink = ({ path, icon, label }) => (
  <Link to={path} className="link">
    {icon} {label}
  </Link>
);

const NavLinkMobile = ({ path, icon, label, closeMenu }) => {
  const navigate = useNavigate();
  return (
    <Link to={path} onClick={() => { navigate(path); closeMenu(); }} className="link-mobile">
      {icon} {label}
    </Link>
  );
};

const ProfileDropdown = ({ currentUser, handleLogout }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="dropdown">
      <button onClick={() => setOpen(!open)} className="dropdown-btn">
        <FaUserCircle /> {currentUser.username} ▼
      </button>
      {open && (
        <div className="dropdown-content">
          <ul className="dropdown-list">
            <li><Link to="/profile" className="dropdown-item">👤 View Profile</Link></li>
            <li>
              <button onClick={handleLogout} className="dropdown-item-btn">
                🔐 Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const ThemeToggle = ({ darkMode, toggle, mobile }) => (
  <button onClick={toggle} className={mobile ? 'theme-toggle-mobile' : 'theme-toggle'}>
    {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
  </button>
);


export default Navbar;
