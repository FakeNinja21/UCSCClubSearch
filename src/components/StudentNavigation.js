import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
      <button style={styles.button} onClick={() => navigate("/notifications")}>🔔 Notifications</button>
      <button style={styles.button} onClick={() => navigate("/browse-clubs")}>🔍 Browse Clubs</button>
      <button style={styles.button} onClick={() => navigate("/calendar")}>📅 Calendar</button>
      <button style={styles.button} onClick={() => navigate("/profile")}>👤 Profile</button>
      <button style={styles.button} onClick={handleLogout}>🚪 Logout</button>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#003B5C", // UCSC blue
    borderBottom: "2px solid #FFD700", // UCSC gold accent
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

export default Navigation;
