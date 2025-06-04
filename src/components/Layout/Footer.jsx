import React from 'react';
// import './Footer.css'; // Minimal CSS, main layout in App.css

const Footer = ({ isSidebarCollapsed }) => {
  // The className for margin/width adjustment will be applied in App.jsx
  // This component is now simpler.
  return (
    // The wrapper div with dynamic classes is now in App.jsx
    // This component just returns the footer *content*
    <p>DocSoft &copy; {new Date().getFullYear()}</p>
  );
};
export default Footer;