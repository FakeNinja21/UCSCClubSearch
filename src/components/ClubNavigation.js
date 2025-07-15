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
      <button style={styles.button} onClick={() => navigate("/club-profile")}>👤 Club Profile</button>
      <div style={{ position: 'relative' }}>
        <button style={styles.button} onClick={handleDropdown}>📅 Events ▾</button>
        {dropdownOpen && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownItem} onClick={() => handleNav("/create-event")}>Create Event</div>
            <div style={styles.dropdownItem} onClick={() => handleNav("/your-events")}>Your Events</div>
          </div>
        )}
      </div>
      <button style={styles.button} onClick={() => navigate("/club-dashboard")}>📊 Dashboard</button>
      <button style={styles.button} onClick={() => navigate("/")}>🚪 Logout</button>
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
    left: 0,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    minWidth: 140,
    zIndex: 2000,
  },
  dropdownItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    color: '#003B5C',
    fontWeight: 500,
    borderBottom: '1px solid #eee',
    background: '#fff',
  },
};
