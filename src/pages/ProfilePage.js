import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function ProfilePage() {
  const [user] = useAuthState(auth);

  return (
    <div style={styles.container}>
      <h2>👤 Profile</h2>
      {user ? (
        <>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Type:</strong> {user.email.includes("ucsc.edu") ? "Student" : "Club"}</p>
        </>
      ) : (
        <p>Not signed in.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "600px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
};
