import React from 'react';
import { useNavigate } from 'react-router-dom';

const DevDashboard = () => {
  const linkStyle = {
    display: 'block',
    margin: '10px 0',
    fontSize: '18px',
  };
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Developer Dashboard</h1>
      <p>This is a temporary menu to access all pages during development.</p>
      <hr />

      <nav>
        {/* This line is now fixed to point to the correct path */}
        <button style={linkStyle} onClick={() => navigate('/')}>➡️ Go to the Real Landing Page</button>
        
        <button style={linkStyle} onClick={() => navigate('/student-login')}>➡️ Student Login Page</button>
        <button style={linkStyle} onClick={() => navigate('/student-signup')}>➡️ Student Sign Up Page</button>
        <button style={linkStyle} onClick={() => navigate('/club-login')}>➡️ Club Login Page</button>
        <button style={linkStyle} onClick={() => navigate('/club-signup')}>➡️ Club Sign Up Page</button>
        <button style={linkStyle} onClick={() => navigate('/browse-clubs')}>➡️ Browse Clubs Page</button>
        <button style={linkStyle} onClick={() => navigate('/calendar')}>➡️ Calendar Page</button>
        <button style={linkStyle} onClick={() => navigate('/notifications')}>➡️ Notifications Page</button>
      </nav>
    </div>
  );
};

export default DevDashboard;
