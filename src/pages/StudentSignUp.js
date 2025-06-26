import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import clubLogo from "../assets/club_logo.png";

export default function StudentSignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@ucsc.edu")) {
      setError("You must use a valid @ucsc.edu email to sign up.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      navigate("/notifications");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clubLogo} alt="Club Logo" style={styles.logo} />
        <h2>Student Sign Up</h2>

        <form onSubmit={handleSignUp} style={styles.form}>
          <input
            type="email"
            placeholder="UCSC Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={styles.primaryBtn}>
            Create Account
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/student-login")}
          style={styles.linkBtn}
        >
          Already have an account? Log in here
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  logo: {
    width: "120px",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  primaryBtn: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "14px",
  },
};
