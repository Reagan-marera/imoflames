export const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';

    Object.assign(container.style, {
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '90%',
      maxWidth: '400px',
      pointerEvents: 'none', // allows clicks through container
    });

    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.innerText = message;

  // Base styles
  Object.assign(toast.style, {
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    opacity: '0',
    transform: 'translateY(-10px)',
    transition: 'all 0.3s ease',
    pointerEvents: 'auto',
  });

  // Type styles
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
  };

  toast.style.background = colors[type] || colors.success;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
