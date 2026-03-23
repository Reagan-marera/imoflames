import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { showToast } from './utils.js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [floatingCart, setFloatingCart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  // Google OAuth Configuration
  const GOOGLE_CLIENT_ID = '1091457995598-tljcv8ub2d6pu7707ndt374v5elh0jud.apps.googleusercontent.com';
  const GOOGLE_REDIRECT_URI = `${window.location.origin}/login`;

  // Load remembered username if exists
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUsername');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  }, []);

  // Check for Google OAuth callback from URL hash fragment
  useEffect(() => {
    // Function to parse the hash fragment for access token
    const handleHashFragment = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Remove the '#' and parse as query string
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const tokenType = params.get('token_type');
        const expiresIn = params.get('expires_in');
        
        if (accessToken) {
          console.log('Access token found in hash fragment');
          handleGoogleCallback(accessToken, tokenType, expiresIn);
          return true;
        }
      }
      return false;
    };

    // Also check query parameters (fallback)
    const handleQueryParams = () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        console.log('Access token found in query params');
        handleGoogleCallback(accessToken);
        return true;
      }
      return false;
    };

    // Check both locations for the token
    if (!handleHashFragment() && !handleQueryParams()) {
      // Check for error in URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error') || new URLSearchParams(location.search).get('error');
      if (error) {
        console.error('OAuth error:', error);
        showToast(`Google login error: ${error}`, "error");
        setIsGoogleLoading(false);
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location]);

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

  // Handle Google OAuth callback and send token to backend
  const handleGoogleCallback = async (accessToken, tokenType = 'Bearer', expiresIn = 3600) => {
    setIsGoogleLoading(true);
    try {
      console.log('Processing Google callback...');
      
      // Step 1: Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `${tokenType} ${accessToken}`
        }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('Google user info received:', userInfo);
      
      // Step 2: Send to your backend to create/login user
      const backendResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          username: userInfo.name || userInfo.email.split('@')[0],
          picture: userInfo.picture,
          accessToken: accessToken
        })
      });
      
      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Failed to authenticate with backend');
      }
      
      const backendData = await backendResponse.json();
      console.log('Backend authentication successful');
      
      // Step 3: Store the JWT token from your backend (not Google's token)
      localStorage.setItem('token', backendData.token);
      localStorage.setItem('user', JSON.stringify(backendData.user));
      
      showToast(`Welcome ${backendData.user.username}! 🎉`, "success");
      
      // Step 4: Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Step 5: Redirect to products page
      setTimeout(() => {
        navigate('/shop'); // or '/' depending on your products page route
      }, 1000);
      
    } catch (error) {
      console.error('Google login error:', error);
      showToast(error.message || "Google login failed. Please try again.", "error");
      // Clean up URL on error
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Send credentials to your backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: username,
          password: password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        
        showToast(`Welcome back ${data.user.username}! 🎉`, "success");
        
        // Redirect to products page
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      } else {
        showToast(data.message || 'Login failed. Please try again.', "error");
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login Handler
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    
    // Google OAuth 2.0 parameters
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'token', // Using token for implicit flow
      scope: 'email profile',
      include_granted_scopes: 'true',
      state: Date.now().toString() // Add state to prevent CSRF
    });
    
    console.log('Redirecting to Google OAuth...');
    // Redirect to Google OAuth consent screen
    window.location.href = `${googleAuthUrl}?${params.toString()}`;
  };

  return (
    <div style={styles.container}>
      {/* Animated Background Elements */}
      <div style={styles.backgroundElements}>
        <div style={styles.floatingBag1}>🛍️</div>
        <div style={styles.floatingBag2}>🛒</div>
        <div style={styles.floatingBag3}>📦</div>
        <div style={styles.floatingBag4}>💎</div>
        <div style={styles.floatingBag5}>✨</div>
        <div style={styles.floatingBag6}>🎁</div>
      </div>

      {/* Main Card */}
      <div style={styles.card}>
        {/* Header with Animation */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <span style={styles.welcomeIcon}>👋</span>
            <span style={styles.shopIcon}>🛍️</span>
          </div>
          <h1 style={styles.title}>Welcome Back!</h1>
          <p style={styles.subtitle}>Sign in to continue shopping</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>👤</div>
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>🔒</div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

          {/* Remember Me & Forgot Password */}
          <div style={styles.optionsContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot Password?
            </Link>
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
                <span>Sign In</span>
                <span style={styles.buttonIcon}>→</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or continue with</span>
          <span style={styles.dividerLine}></span>
        </div>

        {/* Google Login Button */}
        <div style={styles.socialButtons}>
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            style={{
              ...styles.socialButton,
              ...(isGoogleLoading ? styles.buttonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!isGoogleLoading) {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#667eea';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            {isGoogleLoading ? (
              <span style={styles.loadingSpinner}>⏳</span>
            ) : (
              <>
                <span style={styles.socialIcon}>
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    style={{ width: '20px', height: '20px' }}
                  />
                </span>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Sign Up Link */}
        <div style={styles.signupSection}>
          <p style={styles.signupText}>
            New to IMOFLAMES?{' '}
            <Link to="/register" style={styles.signupLink}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div style={styles.trustBadges}>
          <span>✓ Secure Login</span>
          <span>✓ Encrypted Data</span>
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

      {/* Welcome Message Animation */}
      <div style={styles.welcomeMessage}>
        <span>✨ Welcome to IMOFLAMES! ✨</span>
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
  floatingBag6: {
    position: 'absolute',
    fontSize: '33px',
    animation: 'float1 16s infinite linear reverse',
    top: '70%',
    right: '20%',
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
  welcomeIcon: {
    fontSize: '40px',
    display: 'inline-block',
    animation: 'wave 1s infinite'
  },
  shopIcon: {
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
    gap: '20px'
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
    outline: 'none'
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
  optionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-5px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: '13px',
    color: '#666',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  forgotLink: {
    fontSize: '13px',
    color: '#667eea',
    textDecoration: 'none',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    transition: 'color 0.2s ease'
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
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
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
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '20px 0',
    gap: '10px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0'
  },
  dividerText: {
    fontSize: '12px',
    color: '#999',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  socialButtons: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px 24px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    width: '100%'
  },
  socialIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  signupSection: {
    textAlign: 'center',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  signupText: {
    fontSize: '14px',
    color: '#666',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  signupLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.2s ease'
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
  },
  welcomeMessage: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(255,255,255,0.95)',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#667eea',
    animation: 'slideInRight 0.5s ease-out',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000
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
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(15deg); }
    75% { transform: rotate(-15deg); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }
  .forgot-link:hover, .signup-link:hover {
    color: #764ba2;
    text-decoration: underline;
  }
  @media (max-width: 768px) {
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
    .options-container {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;