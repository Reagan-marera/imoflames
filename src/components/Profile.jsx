// Profile.js - Updated with token handling, compact layout, and save button
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCamera, FaSave, FaEdit, FaLock, FaCheck, FaTimes, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'edit', 'password'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    checkTokenAndFetchProfile();
  }, []);

  const checkTokenAndFetchProfile = async () => {
    if (!token) {
      showToast('Please login to view your profile', 'error');
      navigate('/login');
      return;
    }
    await fetchUserProfile();
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        navigate('/login');
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username,
          email: data.email,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        if (data.profile_picture) {
          setProfilePreview(`${API_URL}/uploads/${data.profile_picture}`);
        }
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to load profile', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile. Please check your connection.', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      setProfilePicture(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicture) return;
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('profile_picture', profilePicture);
    
    try {
      const res = await fetch(`${API_URL}/api/user/profile-picture`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        navigate('/login');
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        showToast('Profile picture updated successfully!', 'success');
        setUser(prev => ({ ...prev, profile_picture: data.profile_picture }));
        setProfilePicture(null);
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update profile picture', 'error');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showToast('Failed to upload profile picture', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelProfilePicture = () => {
    setProfilePicture(null);
    if (user?.profile_picture) {
      setProfilePreview(`${API_URL}/uploads/${user.profile_picture}`);
    } else {
      setProfilePreview(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
      };
      
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        navigate('/login');
        return;
      }
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
        setActiveTab('info');
        showToast('Profile updated successfully!', 'success');
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (formData.new_password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        navigate('/login');
        return;
      }
      
      if (res.ok) {
        showToast('Password changed successfully!', 'success');
        setFormData({
          ...formData,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setActiveTab('info');
      } else {
        const error = await res.json();
        showToast(error.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundElements}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingElement,
              left: `${Math.random() * 100}%`,
              animation: `float${(i % 5) + 1} ${15 + Math.random() * 20}s infinite linear`
            }}
          >
            {['👤', '✨', '🌟', '⭐', '💫', '✨'][i % 6]}
          </div>
        ))}
      </div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft /> Back
        </button>

        <div style={styles.header}>
          <div style={styles.profilePictureContainer}>
            <div style={styles.profilePictureWrapper}>
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" style={styles.profilePicture} />
              ) : (
                <div style={styles.profilePlaceholder}>
                  <FaUser size={48} />
                </div>
              )}
              <label htmlFor="profile-picture" style={styles.cameraIcon}>
                <FaCamera size={14} />
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {profilePicture && (
              <div style={styles.pictureActions}>
                <button onClick={handleSaveProfilePicture} style={styles.savePictureBtn} disabled={isUploading}>
                  {isUploading ? <FaSpinner style={styles.spinner} /> : <FaCheck />}
                </button>
                <button onClick={handleCancelProfilePicture} style={styles.cancelPictureBtn}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          <h1 style={styles.title}>{user.username}</h1>
          <p style={styles.subtitle}>{user.email}</p>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => { setActiveTab('info'); setIsEditing(false); }}
            style={{ ...styles.tab, ...(activeTab === 'info' ? styles.activeTab : {}) }}
          >
            <FaUser size={12} /> Info
          </button>
          <button
            onClick={() => { setActiveTab('edit'); setIsEditing(true); }}
            style={{ ...styles.tab, ...(activeTab === 'edit' ? styles.activeTab : {}) }}
          >
            <FaEdit size={12} /> Edit
          </button>
          <button
            onClick={() => { setActiveTab('password'); setIsEditing(true); }}
            style={{ ...styles.tab, ...(activeTab === 'password' ? styles.activeTab : {}) }}
          >
            <FaLock size={12} /> Password
          </button>
        </div>

        {/* Profile Info Tab */}
        {activeTab === 'info' && (
          <div style={styles.profileInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Username</span>
              <span style={styles.infoValue}>{user.username}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{user.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Status</span>
              <span style={styles.infoValue}>
                {user.is_verified ? (
                  <span style={styles.verified}><FaCheck size={10} /> Verified</span>
                ) : (
                  <span style={styles.unverified}>Not Verified</span>
                )}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Role</span>
              <span style={styles.infoValue}>
                {user.is_admin ? 'Administrator' : (user.can_upload ? 'Seller' : 'Customer')}
              </span>
            </div>
            {user.created_at && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Member Since</span>
                <span style={styles.infoValue}>
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && (
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}>👤</div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}>📧</div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.buttonDisabled : {})
                }}
              >
                {isLoading ? <FaSpinner style={styles.spinner} /> : <FaSave />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('info'); setIsEditing(false); }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}>🔒</div>
              <input
                type="password"
                name="current_password"
                placeholder="Current Password"
                value={formData.current_password}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}>🔐</div>
              <input
                type="password"
                name="new_password"
                placeholder="New Password"
                value={formData.new_password}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}>✓</div>
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm New Password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.buttonDisabled : {}),
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)'
                }}
              >
                {isLoading ? <FaSpinner style={styles.spinner} /> : <FaLock />}
                Change Password
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('info'); setIsEditing(false); }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '60px 20px 40px',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif"
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden'
  },
  floatingElement: {
    position: 'absolute',
    fontSize: '24px',
    opacity: 0.1,
    pointerEvents: 'none'
  },
  card: {
    maxWidth: '500px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '24px',
    position: 'relative',
    zIndex: 1
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    marginBottom: '16px',
    transition: 'all 0.2s'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  profilePictureContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '12px'
  },
  profilePictureWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px'
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #667eea'
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  cameraIcon: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    background: '#667eea',
    borderRadius: '50%',
    padding: '6px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    width: '26px',
    height: '26px'
  },
  pictureActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },
  savePictureBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  cancelPictureBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#999'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '8px'
  },
  tab: {
    padding: '6px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    borderRadius: '20px'
  },
  activeTab: {
    color: '#667eea',
    background: 'rgba(102,126,234,0.1)'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  infoRow: {
    display: 'flex',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoLabel: {
    width: '100px',
    fontWeight: '600',
    color: '#666',
    fontSize: '13px'
  },
  infoValue: {
    flex: 1,
    color: '#333',
    fontSize: '13px',
    wordBreak: 'break-word'
  },
  verified: {
    color: '#28a745',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  unverified: {
    color: '#dc3545'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '14px',
    color: '#999',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    outline: 'none'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px'
  },
  submitButton: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  cancelButton: {
    flex: 1,
    background: '#f5f5f5',
    color: '#666',
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    color: 'white'
  },
  loadingSpinner: {
    fontSize: '40px',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  }
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes float1 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(30px, 20px); }
  }
  @keyframes float2 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-20px, 30px); }
  }
  @keyframes float3 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(40px, -10px); }
  }
  @keyframes float4 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-30px, -20px); }
  }
  @keyframes float5 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(20px, -30px); }
  }
  input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 2px rgba(102,126,234,0.1) !important;
  }
  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;
document.head.appendChild(styleSheet);

export default Profile;