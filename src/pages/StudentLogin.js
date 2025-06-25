import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Logging in with Email: ${email} and Password: ${password}`);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="email" style={{ marginRight: '10px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="password" style={{ marginRight: '10px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <button style={{ marginTop: '20px' }} onClick={() => navigate('/student-signup')}>
        Go to Student Sign Up
      </button>
    </div>
  );
};

export default StudentLogin;