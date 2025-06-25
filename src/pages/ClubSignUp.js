// src/pages/ClubSignUp.js

import React, { useState } from 'react';

const ClubSignUp = () => {
  // We need more state variables for a sign-up form
  const [clubName, setClubName] = useState('');
  const [clubEmail, setClubEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clubDescription, setClubDescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const clubData = {
      name: clubName,
      email: clubEmail,
      description: clubDescription,
      // NOTE: In a real app, you would securely hash the password on the backend
    };
    alert(`Creating new club with data: ${JSON.stringify(clubData, null, 2)}`);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Register a New Club</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="clubName" style={{ marginRight: '10px', display: 'block' }}>Club Name:</label>
          <input
            type="text"
            id="clubName"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="clubEmail" style={{ marginRight: '10px', display: 'block' }}>Contact Email:</label>
          <input
            type="email"
            id="clubEmail"
            value={clubEmail}
            onChange={(e) => setClubEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="password" style={{ marginRight: '10px', display: 'block' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label htmlFor="clubDescription" style={{ marginRight: '10px', display: 'block' }}>Club Description:</label>
          <textarea
            id="clubDescription"
            value={clubDescription}
            onChange={(e) => setClubDescription(e.target.value)}
            rows="4"
            style={{width: '250px'}}
          />
        </div>
        <button type="submit">Complete Registration</button>
      </form>
    </div>
  );
};

export default ClubSignUp;