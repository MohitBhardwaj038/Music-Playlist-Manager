import React from 'react';
import { useToast } from '../context/ToastContext';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import '../styles/toast.css';

const iconMap = {
  success: <FaCheckCircle />,
  error: <FaExclamationCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{iconMap[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
