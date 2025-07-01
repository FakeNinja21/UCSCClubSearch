import React from "react";
import { useNavigate } from "react-router-dom";

export default function ClubNavigation() {
  const navigate = useNavigate();

  return (
    <nav style={styles.navbar}>
      <button style={styles.button} onClick={() => navigate("/club-profile")}>👤 Club Profile</button>
      <button style={styles.button} onClick={() => navigate("/club-events")}>📅 Events</button>
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
    padding: "10px",
    backgroundColor: "#003B5C", // UCSC blue
    borderBottom: "2px solid #FFD700", // UCSC gold
    borderRadius: "0 0 12px 12px",
    marginBottom: "1rem",
    fontFamily: "Arial, sans-serif",
  },
  button: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    padding: "10px",
  },
};
