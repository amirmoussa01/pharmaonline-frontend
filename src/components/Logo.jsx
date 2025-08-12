// src/components/Logo.jsx
import React from 'react';

const Logo = ({ width = 120, height = 120 }) => {
  return (
    <img
      src="/logo.png"
      alt="Logo Alheri Pharma"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;