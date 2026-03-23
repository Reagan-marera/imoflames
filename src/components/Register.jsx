import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [floatingCart, setFloatingCart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Animate floating shopping elements
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingCart({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]+/)) strength++;
    if (pwd.match(/[A-Z]+/)) strength++;
    if (pwd.match(/[0-9]+/)) strength++;
    if (pwd.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    
    if (passwordStrength < 3) {
      showToast("Please use a stronger password", "error");
      return;
    }
    
    setIsLoading(true);
    
    const requestBody = {
      username,
      email,
      password
    };
    
    if (isAdminMode) {
      requestBody.admin_secret = adminSecret;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(data.message || "Registration successful! Welcome to ShopHub! 🎉", "success");
        setTimeout(() => navigate('/login'), 1500);
      } else {
        showToast(data.message || 'Registration failed', "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error registering", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#ff4757';
    if (passwordStrength === 3) return '#ffa502';
    return '#2ed573';
  };

  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.floatingBag1}>🛍️</div>
        <div style={styles.floatingBag2}>🛒</div>
        <div style={styles.floatingBag3}>📦</div>
        <div style={styles.floatingBag4}>💎</div>
        <div style={styles.floatingBag5}>👕</div>
      </div>

      {/* Main Card */}
      <div style={styles.card}>
        {/* Header with Animation */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.shoppingIcon}>🛍️</span>
            <span style={styles.cartIcon}>🛒</span>
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join imoflames and start shopping!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>👤</div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>📧</div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>🔒</div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div style={styles.strengthContainer}>
              <div style={styles.strengthBar}>
                <div style={{
                  ...styles.strengthFill,
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: getPasswordStrengthColor(),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={styles.strengthText}>
                {passwordStrength <= 2 && "Weak"}
                {passwordStrength === 3 && "Good"}
                {passwordStrength >= 4 && "Strong"}
              </span>
            </div>
          )}

          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>🔐</div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Admin Registration Section */}
          <div style={styles.adminSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAdminMode}
                onChange={(e) => {
                  setIsAdminMode(e.target.checked);
                  if (!e.target.checked) setAdminSecret('');
                }}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Register as Vendor/Administrator</span>
              <span style={styles.vendorBadge}>⭐ Vendor Access</span>
            </label>
            
            {isAdminMode && (
              <div style={styles.adminSecretContainer}>
                <div style={styles.inputGroup}>
                  <div style={styles.inputIcon}>🔑</div>
                  <input
                    type="password"
                    placeholder="Vendor Authorization Code"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    required
                    autoComplete="off"
                    style={styles.input}
                  />
                </div>
                <small style={styles.helpText}>
                  * Vendor code required for seller account
                </small>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
          >
            {isLoading ? (
              <span style={styles.loadingSpinner}>⏳</span>
            ) : (
              <>
                <span>Join Now</span>
                <span style={styles.buttonIcon}>→</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={styles.loginSection}>
          <p style={styles.loginText}>
            Already have an account?{' '}
            <a href="/login" style={styles.loginLink}>
              Sign In
            </a>
          </p>
        </div>

        {/* Trust Badges */}
        <div style={styles.trustBadges}>
          <span>✓ Secure Checkout</span>
          <span>✓ 30-Day Returns</span>
          <span>✓ 24/7 Support</span>
        </div>
      </div>

      {/* Floating Cart Animation */}
      <div style={{
        ...styles.floatingCart,
        left: floatingCart.x,
        top: floatingCart.y,
        opacity: 0.6
      }}>
        🛒
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: "'Poppins', 'Segoe UI', 'Roboto', sans-serif"
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  floatingBag1: {
    position: 'absolute',
    fontSize: '40px',
    animation: 'float1 15s infinite linear',
    top: '10%',
    left: '5%',
    opacity: 0.3
  },
  floatingBag2: {
    position: 'absolute',
    fontSize: '35px',
    animation: 'float2 12s infinite linear',
    bottom: '15%',
    right: '8%',
    opacity: 0.3
  },
  floatingBag3: {
    position: 'absolute',
    fontSize: '45px',
    animation: 'float3 18s infinite linear',
    top: '60%',
    left: '85%',
    opacity: 0.3
  },
  floatingBag4: {
    position: 'absolute',
    fontSize: '30px',
    animation: 'float4 20s infinite linear',
    top: '20%',
    right: '15%',
    opacity: 0.3
  },
  floatingBag5: {
    position: 'absolute',
    fontSize: '38px',
    animation: 'float5 14s infinite linear',
    bottom: '30%',
    left: '10%',
    opacity: 0.3
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    position: 'relative',
    zIndex: 1,
    animation: 'slideUp 0.5s ease-out',
    transition: 'transform 0.3s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  iconContainer: {
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },
  shoppingIcon: {
    fontSize: '40px',
    display: 'inline-block',
    animation: 'bounce 1s infinite'
  },
  cartIcon: {
    fontSize: '40px',
    display: 'inline-block',
    animation: 'bounce 1s infinite 0.2s'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '18px',
    color: '#999',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    outline: 'none',
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    }
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    color: '#999'
  },
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '-5px'
  },
  strengthBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  strengthText: {
    fontSize: '11px',
    color: '#666'
  },
  adminSection: {
    marginTop: '10px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e0e0e0'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    flexWrap: 'wrap'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: '14px',
    color: '#333',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  vendorBadge: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
    marginLeft: 'auto'
  },
  adminSecretContainer: {
    marginTop: '10px'
  },
  helpText: {
    display: 'block',
    color: '#dc3545',
    fontSize: '11px',
    marginTop: '5px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    marginTop: '10px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)'
    }
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  buttonIcon: {
    fontSize: '18px',
    transition: 'transform 0.2s ease'
  },
  loadingSpinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite'
  },
  loginSection: {
    textAlign: 'center',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  loginText: {
    fontSize: '14px',
    color: '#666',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  loginLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 'bold',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  trustBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
    fontSize: '11px',
    color: '#999',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  floatingCart: {
    position: 'fixed',
    fontSize: '30px',
    pointerEvents: 'none',
    transition: 'all 3s ease',
    zIndex: 999,
    animation: 'float 2s ease-in-out infinite'
  }
};

// Add CSS animations to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float1 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(50px, 30px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes float2 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-40px, 20px) rotate(-180deg); }
    100% { transform: translate(0, 0) rotate(-360deg); }
  }
  @keyframes float3 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-30px, -40px) rotate(90deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes float4 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(60px, -20px) rotate(-90deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes float5 {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-50px, -30px) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
  button:hover .button-icon {
    transform: translateX(5px);
  }
  @media (max-width: 768px) {
    .auth-container {
      padding: 10px;
    }
    .auth-card {
      padding: 25px;
    }
    .auth-title {
      font-size: 24px;
    }
  }
  @media (max-width: 480px) {
    .trust-badges {
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .vendor-badge {
      margin-left: 0;
      margin-top: 5px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Register;