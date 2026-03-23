// Profile.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCamera, FaSave, FaEdit, FaLock, FaCheck } from 'react-icons/fa';
import { API_URL } from '../config';
import { showToast } from './utils';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
          setProfilePreview(`${API_URL}/api/uploads/${data.profile_picture}`);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile', 'error');
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

  const uploadProfilePicture = async () => {
    if (!profilePicture) return null;
    
    const formData = new FormData();
    formData.append('profile_picture', profilePicture);
    
    try {
      const res = await fetch(`${API_URL}/api/user/profile-picture`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.profile_picture;
      }
      return null;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update profile picture if changed
      let profilePicturePath = user?.profile_picture;
      if (profilePicture) {
        const uploadedPath = await uploadProfilePicture();
        if (uploadedPath) {
          profilePicturePath = uploadedPath;
        }
      }
      
      // Update user info
      const updateData = {
        username: formData.username,
        email: formData.email,
        profile_picture: profilePicturePath
      };
      
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
      
      if (res.ok) {
        showToast('Password changed successfully!', 'success');
        setFormData({
          ...formData,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
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
        <div style={styles.header}>
          <div style={styles.profilePictureContainer}>
            <div style={styles.profilePictureWrapper}>
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" style={styles.profilePicture} />
              ) : (
                <div style={styles.profilePlaceholder}>
                  <FaUser size={60} />
                </div>
              )}
              <label htmlFor="profile-picture" style={styles.cameraIcon}>
                <FaCamera />
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your account information</p>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setIsEditing(false)}
            style={{ ...styles.tab, ...(!isEditing ? styles.activeTab : {}) }}
          >
            <FaUser /> Profile Info
          </button>
          <button
            onClick={() => setIsEditing(true)}
            style={{ ...styles.tab, ...(isEditing ? styles.activeTab : {}) }}
          >
            <FaEdit /> Edit Profile
          </button>
          <button
            onClick={() => setIsEditing(true)}
            style={{ ...styles.tab, ...(isEditing ? styles.activeTab : {}) }}
          >
            <FaLock /> Change Password
          </button>
        </div>

        {!isEditing ? (
          // View Profile
          <div style={styles.profileInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Username:</span>
              <span style={styles.infoValue}>{user.username}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{user.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Account Status:</span>
              <span style={styles.infoValue}>
                {user.is_verified ? (
                  <span style={styles.verified}><FaCheck /> Verified</span>
                ) : (
                  <span style={styles.unverified}>Not Verified</span>
                )}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Role:</span>
              <span style={styles.infoValue}>
                {user.is_admin ? 'Administrator' : (user.can_upload ? 'Seller' : 'Customer')}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Member Since:</span>
              <span style={styles.infoValue}>
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          // Edit Profile Form
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
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </form>
        )}

        {/* Change Password Section */}
        {isEditing && (
          <form onSubmit={handleChangePassword} style={{...styles.form, marginTop: '20px'}}>
            <h3 style={styles.sectionTitle}>Change Password</h3>
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

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.submitButton,
                ...(isLoading ? styles.buttonDisabled : {}),
                background: 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)'
              }}
            >
              {isLoading ? (
                <span style={styles.loadingSpinner}>⏳</span>
              ) : (
                <>
                  <FaLock /> Change Password
                </>
              )}
            </button>
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
    padding: '80px 20px 40px',
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
    fontSize: '30px',
    opacity: 0.1,
    pointerEvents: 'none'
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px',
    position: 'relative',
    zIndex: 1
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  profilePictureContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  profilePictureWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px'
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #667eea'
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
    bottom: '5px',
    right: '5px',
    background: '#667eea',
    borderRadius: '50%',
    padding: '8px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #e0e0e0'
  },
  tab: {
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    color: '#667eea',
    borderBottom: '2px solid #667eea',
    marginBottom: '-2px'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  infoRow: {
    display: 'flex',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  infoLabel: {
    width: '120px',
    fontWeight: '600',
    color: '#666'
  },
  infoValue: {
    flex: 1,
    color: '#333'
  },
  verified: {
    color: '#28a745',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px'
  },
  unverified: {
    color: '#dc3545'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px'
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
  loadingSpinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    color: 'white'
  }
};

export default Profile;