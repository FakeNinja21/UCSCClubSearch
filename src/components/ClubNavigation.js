import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClubNavigation() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdown = () => setDropdownOpen((open) => !open);
  const handleNav = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  return (
    <nav style={styles.navbar}>
      <button style={styles.button} onClick={() => navigate('/club-profile')}>👤 Club Profile</button>
      <button style={styles.button} onClick={() => navigate('/club-calendar')}>📅 Calendar</button>
      <div style={{ position: 'relative' }}>
        <button style={styles.button} onClick={handleDropdown}>📅 Events ▾</button>
        {dropdownOpen && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownItem} onClick={() => handleNav('/create-event')}>Create Event</div>
            <div style={styles.dropdownItem} onClick={() => handleNav('/your-events')}>Your Events</div>
          </div>
        )}
      </div>
      <button style={styles.button} onClick={() => navigate('/club-dashboard')}>📊 Dashboard</button>
      <button style={styles.button} onClick={() => navigate('/')}>🚪 Logout</button>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "10px 0", // Remove left/right padding
    backgroundColor: "#003B5C", // UCSC blue
    borderBottom: "2px solid #FFD700", // UCSC gold
    borderRadius: "0 0 12px 12px",
    marginBottom: "1rem",
    fontFamily: "Arial, sans-serif",
    width: "100vw", // Full viewport width
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    boxSizing: "border-box"
  },
  button: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    padding: "10px",
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1001,
    minWidth: '150px',
    padding: '5px 0',
  },
  dropdownItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    color: '#333',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  },
};
