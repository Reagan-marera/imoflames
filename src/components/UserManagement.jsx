import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUsers, FaUserEdit, FaTrash, FaKey, FaShieldAlt, 
  FaCheckCircle, FaTimesCircle, FaSpinner, FaSearch,
  FaChevronLeft, FaChevronRight, FaUser, FaEnvelope,
  FaCalendar, FaBan, FaCheck, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { API_URL } from '../config.js';
import { showToast } from './utils.js';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    if (!token) {
      showToast("Authentication required", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } else if (res.status === 401) {
        showToast("Unauthorized — Please log in again", "error");
      } else if (res.status === 403) {
        showToast("Access denied — Admins only", "error");
      } else {
        showToast("Failed to fetch users", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [token]);

  // Filter users based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Toggle upload permission
  const toggleUploadPermission = async (userId, currentCanUpload) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ can_upload: !currentCanUpload })
      });

      if (res.ok) {
        const result = await res.json();
        fetchUsers(); // Refresh user list
        showToast(`Upload permission ${!currentCanUpload ? 'granted' : 'revoked'} successfully`, "success");
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to update permission", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating upload permission", "error");
    }
  };

  // Toggle admin role
  const toggleAdminRole = async (userId, currentIsAdmin) => {
    // Prevent demoting yourself
    if (currentUser && userId === currentUser.id) {
      showToast("You cannot modify your own admin status", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_admin: !currentIsAdmin })
      });

      if (res.ok) {
        const result = await res.json();
        fetchUsers();
        showToast(`Admin status ${!currentIsAdmin ? 'granted' : 'revoked'} successfully`, "success");
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to update admin role", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating admin role", "error");
    }
  };

  // Reset user password
  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (res.ok) {
        const result = await res.json();
        showToast(result.message, "success");
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setSelectedUser(null);
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error resetting password", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const deleteUser = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (res.ok) {
        const result = await res.json();
        showToast(result.message, "success");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the user list
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to delete user", "error");
      }
    } catch (err) {
      console.error('Delete user error:', err);
      showToast("Error deleting user: " + (err.message || "Network error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <FaSpinner style={styles.spinner} />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <FaUsers size={28} />
        </div>
        <h1 style={styles.title}>User Management</h1>
        <p style={styles.subtitle}>Manage users, permissions, and accounts</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={styles.clearSearch}>
            ✕
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{users.length}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{users.filter(u => u.is_admin).length}</div>
          <div style={styles.statLabel}>Admins</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{users.filter(u => u.can_upload).length}</div>
          <div style={styles.statLabel}>Sellers</div>
        </div>
      </div>

      {/* Users Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Upload</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={styles.tableRow}
              >
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={styles.userAvatar}>
                      {user.profile_picture ? (
                        <img src={`${API_URL}/uploads/${user.profile_picture}`} alt={user.username} style={styles.avatar} />
                      ) : (
                        <FaUser size={16} />
                      )}
                    </div>
                    <div>
                      <div style={styles.userName}>{user.username}</div>
                      <div style={styles.userId}>ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.emailCell}>
                    <FaEnvelope size={12} style={styles.emailIcon} />
                    {user.email}
                  </div>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleAdminRole(user.id, user.is_admin)}
                    style={{
                      ...styles.roleBadge,
                      ...(user.is_admin ? styles.adminBadge : styles.userBadge),
                      cursor: 'pointer'
                    }}
                    title={user.id === currentUser?.id ? "Cannot modify your own role" : "Toggle admin role"}
                    disabled={user.id === currentUser?.id}
                  >
                    {user.is_admin ? 'Admin' : 'User'}
                  </button>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleUploadPermission(user.id, user.can_upload)}
                    style={{
                      ...styles.permissionToggle,
                      ...(user.can_upload ? styles.permissionGranted : styles.permissionDenied)
                    }}
                  >
                    {user.can_upload ? (
                      <><FaCheck size={10} /> Granted</>
                    ) : (
                      <><FaTimesCircle size={10} /> Denied</>
                    )}
                  </button>
                </td>
                <td style={styles.td}>
                  <div style={styles.dateCell}>
                    <FaCalendar size={10} />
                    {formatDate(user.created_at)}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                      }}
                      style={styles.resetPasswordBtn}
                      title="Reset Password"
                    >
                      <FaKey size={14} />
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        style={styles.deleteUserBtn}
                        title="Delete User"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={styles.noResults}>
            <p>No users found matching your search</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageDisabled : {}) }}
          >
            <FaChevronLeft size={12} /> Prev
          </button>
          <div style={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    ...styles.pageNumber,
                    ...(currentPage === pageNum ? styles.pageActive : {})
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageDisabled : {}) }}
          >
            Next <FaChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showPasswordModal && selectedUser && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowPasswordModal(false);
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Reset Password</h2>
                <button onClick={() => setShowPasswordModal(false)} style={styles.modalClose}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <p style={styles.modalUserInfo}>
                  Reset password for: <strong>{selectedUser.username}</strong>
                </p>
                <div style={styles.inputGroup}>
                  <label>New Password (min. 6 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.modalInput}
                    placeholder="Enter new password"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.modalInput}
                    placeholder="Confirm new password"
                  />
                </div>
                <div style={styles.modalButtons}>
                  <button onClick={() => setShowPasswordModal(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button onClick={resetPassword} disabled={isSubmitting} style={styles.confirmBtn}>
                    {isSubmitting ? <FaSpinner style={styles.spinnerSmall} /> : 'Reset Password'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              style={styles.modalSmall}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2>Delete User</h2>
                <button onClick={() => setShowDeleteModal(false)} style={styles.modalClose}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.warningIcon}>⚠️</div>
                <p style={styles.warningText}>
                  Are you sure you want to delete <strong>{selectedUser.username}</strong>?
                </p>
                <p style={styles.warningSubtext}>
                  This action cannot be undone. All user data including products, orders, and reviews will be permanently deleted.
                </p>
                <div style={styles.modalButtons}>
                  <button onClick={() => setShowDeleteModal(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button onClick={deleteUser} disabled={isSubmitting} style={styles.deleteConfirmBtn}>
                    {isSubmitting ? <FaSpinner style={styles.spinnerSmall} /> : 'Delete User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: '60px 20px 40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  headerIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    background: '#000000',
    borderRadius: '50%',
    color: '#ffffff',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '400px',
    margin: '0 auto 24px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 36px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#333',
    outline: 'none',
    transition: 'all 0.2s',
  },
  clearSearch: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '14px',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#000000',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#666',
  },
  tableContainer: {
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'auto',
    border: '1px solid #e0e0e0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },
  tableHeader: {
    background: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '13px',
    color: '#555',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userName: {
    fontWeight: '600',
    color: '#000000',
    marginBottom: '4px',
  },
  userId: {
    fontSize: '10px',
    color: '#999',
  },
  emailCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  emailIcon: {
    color: '#999',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    border: 'none',
  },
  adminBadge: {
    background: '#000000',
    color: '#ffffff',
  },
  userBadge: {
    background: '#f0f0f0',
    color: '#666',
  },
  permissionToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  permissionGranted: {
    background: '#d4edda',
    color: '#155724',
  },
  permissionDenied: {
    background: '#f8d7da',
    color: '#721c24',
  },
  dateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#999',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  resetPasswordBtn: {
    padding: '6px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#0c5460',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  },
  deleteUserBtn: {
    padding: '6px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#dc3545',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#333',
  },
  pageDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageNumbers: {
    display: 'flex',
    gap: '8px',
  },
  pageNumber: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#333',
  },
  pageActive: {
    background: '#000000',
    color: '#ffffff',
    borderColor: '#000000',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
  },
  spinner: {
    fontSize: '40px',
    color: '#000000',
    animation: 'spin 1s linear infinite',
  },
  spinnerSmall: {
    fontSize: '14px',
    animation: 'spin 1s linear infinite',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    maxWidth: '450px',
    width: '100%',
    overflow: 'hidden',
  },
  modalSmall: {
    background: '#ffffff',
    borderRadius: '16px',
    maxWidth: '400px',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#999',
  },
  modalBody: {
    padding: '20px',
  },
  modalUserInfo: {
    marginBottom: '16px',
    fontSize: '14px',
    color: '#666',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '6px',
    fontFamily: 'inherit',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#666',
  },
  confirmBtn: {
    flex: 1,
    padding: '10px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  deleteConfirmBtn: {
    flex: 1,
    padding: '10px',
    background: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  warningIcon: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  warningText: {
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '12px',
  },
  warningSubtext: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    marginBottom: '20px',
  },
};

// Add keyframes animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default UserManagement;