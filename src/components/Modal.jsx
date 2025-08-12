import React, { useEffect } from "react";

const Modal = ({ show, onClose, title, children }) => {
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        <button className="modal-close" onClick={onClose}>&times;</button>
      </div>
    </>
  );
};

export default Modal;
