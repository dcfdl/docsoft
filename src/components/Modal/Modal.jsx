import React from 'react';
import './Modal.css'; // Importa o CSS que criaremos a seguir

// eslint-disable-next-line react/prop-types
const Modal = ({ show, onClose, title, children, footer, size = 'md' }) => {
  if (!show) {
    return null;
  }

  // O 'e.stopPropagation()' impede que o clique no conteúdo do modal feche o modal
  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div className={`custom-modal-content modal-${size}`} onClick={e => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h4 className="custom-modal-title">{title}</h4>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>
        <div className="custom-modal-body">
          {children}
        </div>
        {footer && (
          <div className="custom-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;