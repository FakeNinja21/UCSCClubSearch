import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, signInStudentWithEmail, signInStudentWithGoogle, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          navigate("/notifications");
        }
      } else {
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
      const userCredential = await signInStudentWithEmail(email, password);
      await handleRedirect(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInStudentWithGoogle();
      const user = result.user;
      if (!user.email.endsWith("@ucsc.edu")) {
        setError("You must use a valid @ucsc.edu email to sign in.");
        return;
      }
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists()) {
        await user.delete();
        await auth.signOut();
        setError("You must sign up before logging in with Google.");
        return;
      }
      await handleRedirect(user);
    } catch (err) {
      setError("Google Sign In failed: " + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clubLogo} alt="Club Logo" style={styles.logo} />
        <h2>Student Login</h2>

        <button onClick={handleGoogleLogin} style={styles.googleBtn}>
          Log in with Google
        </button>

        <hr style={{ margin: "1rem 0" }} />

        <form onSubmit={handleEmailLogin} style={styles.form}>
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
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" style={styles.primaryBtn}>
            Log In
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/student-signup")}
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