import React from 'react';
import { Link } from 'react-router-dom';

const DevDashboard = () => {
  const linkStyle = {
    display: 'block',
    margin: '10px 0',
    fontSize: '18px',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Developer Dashboard</h1>
      <p>This is a temporary menu to access all pages during development.</p>
      <hr />

      <nav>
        <Link style={linkStyle} to="/landing">➡️ Go to the Real Landing Page</Link>
        <Link style={linkStyle} to="/student-login">➡️ Student Login Page</Link>
        <Link style={linkStyle} to="/main-login">➡️ Club Login Page</Link>
        <Link style={linkStyle} to="/club-signup">➡️ Club Sign Up Page</Link>
        <Link style={linkStyle} to="/browse-clubs">➡️ Browse Clubs Page</Link>
        <Link style={linkStyle} to="/calendar">➡️ Calendar Page</Link>
        <Link style={linkStyle} to="/notifications">➡️ Notifications Page</Link>
      </nav>
    </div>
  );
};

export default DevDashboard;