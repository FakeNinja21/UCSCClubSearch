import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";
import approvedClubEmails from "../data/approvedClubEmails";

const provider = new GoogleAuthProvider();

export default function ClubSignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isApprovedEmail = (email) => {
    return approvedClubEmails.includes(email.toLowerCase());
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!isApprovedEmail(email)) {
        await user.delete();
        await auth.signOut();
        setError("This email is not recognized as an official UCSC club.");
        return;
      }

      await setDoc(doc(db, "clubs", user.uid), {
        email,
        type: "club"
      });

      navigate("/club-profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email;

      if (!isApprovedEmail(userEmail)) {
        await user.delete();
        await auth.signOut();
        setError("This Google account is not recognized as an official UCSC club.");
        return;
      }

      await setDoc(doc(db, "clubs", user.uid), {
        email: userEmail,
        type: "club"
      });

      navigate("/club-profile");
    } catch (err) {
      setError("Google Sign-Up failed: " + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clubLogo} alt="Club Logo" style={styles.logo} />
        <h2>Club Sign Up</h2>

        <button onClick={handleGoogleSignUp} style={styles.googleBtn}>
          Sign up with Google
        </button>

        <hr style={{ margin: "1rem 0" }} />

        <form onSubmit={handleEmailSignUp} style={styles.form}>
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
          onClick={() => navigate("/club-login")}
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
