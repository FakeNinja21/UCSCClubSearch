import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";

const provider = new GoogleAuthProvider();

export default function ClubLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRedirect = async (user) => {
    try {
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.type === "student") {
          navigate("/notifications");
        } else if (userData.type === "club") {
          navigate("/club-dashboard");
        } else {
          // Fallback for unknown types
          navigate("/notifications");
        }
      } else {
        // No user document exists - this shouldn't happen for new sign-ups
        // but could happen for older accounts
        navigate("/notifications");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      navigate("/notifications");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRedirect(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await handleRedirect(result.user);
    } catch (err) {
      setError("Google Login failed: " + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clubLogo} alt="Club Logo" style={styles.logo} />
        <h2>Club Login</h2>

        <button onClick={handleGoogleLogin} style={styles.googleBtn}>
          Log in with Google
        </button>

        <hr style={{ margin: "1rem 0" }} />

        <form onSubmit={handleEmailLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Club Email"
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
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={styles.primaryBtn}>
            Log In
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/club-signup")}
          style={styles.linkBtn}
        >
          Don't have an account? Sign up here
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
  googleBtn: {
    backgroundColor: "#4285F4",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    width: "100%",
    marginBottom: "1rem",
    cursor: "pointer",
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
