import React from 'react';

const Toast = ({ type, message, onClose }) => (
  <div className={`toast ${type}`}>
    {message}
    <button onClick={onClose}>×</button>
  </div>
);

export default Toast;