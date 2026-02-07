import React from 'react';
import '../styles/confirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', danger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{title || 'Confirm Action'}</h3>
        <p className="confirm-message">{message || 'Are you sure?'}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`confirm-btn ${danger ? 'confirm-danger' : 'confirm-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
