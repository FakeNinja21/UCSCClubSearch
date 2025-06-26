import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";

const provider = new GoogleAuthProvider();

export default function StudentSignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!email.endsWith("@ucsc.edu")) {
        await user.delete();
        await auth.signOut();
        setError("You must use a valid @ucsc.edu email to sign up.");
        return;
      }
      if (password !== confirmPassword) {
        await user.delete();
        await auth.signOut();
        setError("Passwords do not match.");
        return;
      }
      // Store user type in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        type: "student"
      });
      navigate("/notifications");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.email.endsWith("@ucsc.edu")) {
        await user.delete();
        await auth.signOut();
        setError("You must use a valid @ucsc.edu email to sign up.");
        return;
      }
      // Check if user doc exists
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists()) {
        await setDoc(userDoc, {
          email: user.email,
          type: "student"
        });
      }
      navigate("/notifications");
    } catch (err) {
      setError("Google Sign Up failed: " + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clubLogo} alt="Club Logo" style={styles.logo} />
        <h2>Student Sign Up</h2>

        <button onClick={handleGoogleSignUp} style={styles.googleBtn}>
          Sign up with Google
        </button>

        <hr style={{ margin: "1rem 0" }} />

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
