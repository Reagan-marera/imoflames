import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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
      <nav style={styles(darkMode).navbar}>
        {/* Logo */}
        <div style={styles(darkMode).logoContainer}>
      
 <h1
 style={{
   cursor: 'pointer',
   color: darkMode ? '#FF4500' : '#D00000',
   fontFamily: 'Arial Black, sans-serif',
   fontSize: '24px',
   textShadow: '0 0 8px orange, 0 0 16px red',
 }}
 onClick={() => navigate('/')}
>
 🔥 ImoFlames
</h1>

        </div>

        {/* Desktop Menu */}
        <ul style={styles(darkMode).desktopMenu}>
          <li><NavLink path="/" icon={<HomeIcon />} label="Home" darkMode={darkMode} /></li>
          <li><NavLink path="/products" icon={<ProductsIcon />} label="Products" darkMode={darkMode} /></li>
          <li><NavLink path="/contact-us" icon={<ContactIcon />} label="Contact Us" darkMode={darkMode} /></li>
          {currentUser ? (
            <>
              <li><NavLink path="/upload" icon={<UploadIcon />} label="Upload" darkMode={darkMode} /></li>
              <li><NavLink path="/cart" icon={<CartIcon />} label="Cart" darkMode={darkMode} /></li>
              <ProfileDropdown currentUser={currentUser} handleLogout={handleLogout} darkMode={darkMode} />
            </>
          ) : (
            <>
              <li><NavLink path="/login" icon={<LoginIcon />} label="Login" darkMode={darkMode} /></li>
              <li><NavLink path="/register" icon={<RegisterIcon />} label="Sign Up" darkMode={darkMode} /></li>
            </>
          )}
          <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} />
        </ul>

        {/* Mobile Hamburger Button */}
        <button onClick={toggleMenu} style={styles(darkMode).hamburgerButton}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul style={styles(darkMode).mobileMenu}>
          <li><NavLinkMobile path="/" icon={<HomeIcon />} label="Home" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
          <li><NavLinkMobile path="/products" icon={<ProductsIcon />} label="Products" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
          <li><NavLinkMobile path="/contact-us" icon={<ContactIcon />} label="Contact Us" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
          {currentUser ? (
            <>
              <li><NavLinkMobile path="/upload" icon={<UploadIcon />} label="Upload" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
              <li><NavLinkMobile path="/cart" icon={<CartIcon />} label="Cart" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
              <li>
                <button onClick={handleLogout} style={styles(darkMode).logoutButton}>
                  <LoginIcon /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><NavLinkMobile path="/login" icon={<LoginIcon />} label="Login" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
              <li><NavLinkMobile path="/register" icon={<RegisterIcon />} label="Sign Up" closeMenu={() => setMenuOpen(false)} darkMode={darkMode} /></li>
            </>
          )}
          <li>
            <ThemeToggle darkMode={darkMode} toggle={toggleDarkMode} mobile />
          </li>
        </ul>
      )}

      {/* Footer for Small Screens */}
      <footer style={styles(darkMode).footer}>
        <ul style={styles(darkMode).footerMenu}>
          <li><NavLink path="/" icon={<HomeIcon />} label="Home" darkMode={darkMode} /></li>
          <li><NavLink path="/products" icon={<ProductsIcon />} label="Products" darkMode={darkMode} /></li>
          <li><NavLink path="/contact-us" icon={<ContactIcon />} label="Contact Us" darkMode={darkMode} /></li>
          {currentUser ? (
            <>
              <li><NavLink path="/upload" icon={<UploadIcon />} label="Upload" darkMode={darkMode} /></li>
              <li><NavLink path="/cart" icon={<CartIcon />} label="Cart" darkMode={darkMode} /></li>
            </>
          ) : (
            <>
              <li><NavLink path="/login" icon={<LoginIcon />} label="Login" darkMode={darkMode} /></li>
              <li><NavLink path="/register" icon={<RegisterIcon />} label="Sign Up" darkMode={darkMode} /></li>
            </>
          )}
        </ul>
      </footer>
    </>
  );
};

// NavLink Component
const NavLink = ({ path, icon, label, darkMode }) => {
  const navigate = useNavigate();
  return (
    <Link to={path} onClick={() => navigate(path)} style={styles(darkMode).link}>
      {icon} {label}
    </Link>
  );
};

// NavLinkMobile Component
const NavLinkMobile = ({ path, icon, label, closeMenu, darkMode }) => {
  const navigate = useNavigate();
  return (
    <Link to={path} onClick={() => { navigate(path); closeMenu(); }} style={styles(darkMode).linkMobile}>
      {icon} {label}
    </Link>
  );
};

// Profile Dropdown
const ProfileDropdown = ({ currentUser, handleLogout, darkMode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={styles(darkMode).dropdown}>
      <button onClick={() => setOpen(!open)} style={styles(darkMode).dropdownBtn}>
        <UserIcon /> {currentUser.username} ▼
      </button>
      {open && (
        <div style={styles(darkMode).dropdownContent}>
          <ul style={styles(darkMode).dropdownList}>
            <li><Link to="/profile" style={styles(darkMode).dropdownItem}>👤 View Profile</Link></li>
            <li>
              <button onClick={handleLogout} style={styles(darkMode).dropdownItemBtn}>
                🔐 Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Theme Toggle
const ThemeToggle = ({ darkMode, toggle, mobile }) => (
  <button onClick={toggle} style={mobile ? styles(darkMode).themeToggleMobile : styles(darkMode).themeToggle}>
    {darkMode ? <SunIcon /> : <MoonIcon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
  </button>
);

// Icons
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 12l9-9 9 9h-3v9h-12v-9H3z" />
  </svg>
);

const ProductsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18h2v-2H7v2zm0-4h2v-2H7v2zm0-4h2V8H7v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V8h-2v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2V8h-2v2z" />
  </svg>
);

const ContactIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10z" />
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const LoginIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5z" />
  </svg>
);

const RegisterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2c-1.82 0-3.53.54-5 1.49 3.91 2.11 5 6.26 5 6.26a5.483 5.483 0 0 1-2.5-.67C4.7 10.44 3 13.43 3 17c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8c-.7 0-1.38.09-2 .26V2z" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect width="24" height="2" rx="1" />
    <rect y="7" width="24" height="2" rx="1" />
    <rect y="14" width="24" height="2" rx="1" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

// Styles
const styles = (darkMode) => ({
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: darkMode ? '#0e0e0e' : '#fff',
    color: darkMode ? '#fff' : '#0e0e0e',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    flexWrap: 'nowrap',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logo: {
    height: '35px',
    cursor: 'pointer',
  },
  desktopMenu: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: '1.5rem',
    alignItems: 'center',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  link: {
    textDecoration: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  hamburgerButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: darkMode ? '#fff' : '#0e0e0e',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '60px',
    right: '20px',
    background: darkMode ? '#1f1f1f' : '#fff',
    padding: '1rem',
    gap: '1rem',
    zIndex: 1000,
    borderRadius: '5px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    listStyle: 'none',
    width: '200px',
    '@media (min-width: 769px)': {
      display: 'none',
    },
  },
  linkMobile: {
    textDecoration: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    textAlign: 'left',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'relative',
  },
  dropdownBtn: {
    background: 'none',
    border: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
  },
  dropdownContent: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: darkMode ? '#2c2c2c' : '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    padding: '0.5rem',
    borderRadius: '5px',
    zIndex: 1000,
    minWidth: '150px',
  },
  dropdownList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  dropdownItem: {
    color: darkMode ? '#fff' : '#0e0e0e',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.5rem',
    textDecoration: 'none',
  },
  dropdownItemBtn: {
    background: 'none',
    border: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    textAlign: 'left',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.5rem',
    cursor: 'pointer',
    width: '100%',
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  themeToggleMobile: {
    background: 'none',
    border: 'none',
    color: darkMode ? '#fff' : '#0e0e0e',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
  },
  footer: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
      position: 'fixed',
      bottom: 0,
      width: '100%',
      backgroundColor: darkMode ? '#0e0e0e' : '#fff',
      padding: '1rem',
      zIndex: 1000,
    },
  },
  footerMenu: {
    display: 'flex',
    justifyContent: 'space-around',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
});

export default Navbar;
