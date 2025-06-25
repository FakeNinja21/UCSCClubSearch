import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClubLogin = () => {
  const [clubEmail, setClubEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Logging in Club with Email: ${clubEmail} and Password: ${password}`);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Club Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="clubEmail" style={{ marginRight: '10px' }}>Club Email:</label>
          <input
            type="email"
            id="clubEmail"
            value={clubEmail}
            onChange={(e) => setClubEmail(e.target.value)}
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

      {/* This section adds a link to a future sign-up page */}
      <hr style={{margin: '20px auto', width: '50%'}}/>
      <p>Don't have an account for your club yet?</p>
      <button onClick={() => navigate('/club-signup')}>Register New Club</button>
    </div>
  );
};

export default ClubLogin;