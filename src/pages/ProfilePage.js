import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import StudentNavigation from "../components/StudentNavigation";

export default function ProfilePage() {
  const [user] = useAuthState(auth);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (user) {
        try {
          const userDoc = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDoc);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserType(userData.type);
          } else {
            setUserType("Unknown");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUserType("Error");
        }
      } else {
        setUserType(null);
      }
      setLoading(false);
    };

    fetchUserType();
  }, [user]);

  return (
    <div>
      <StudentNavigation />
      <div style={styles.container}>
        <h2>👤 Profile</h2>
        {user ? (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Type:</strong> {loading ? "Loading..." : userType}</p>
          </>
        ) : (
          <p>Not signed in.</p>
        )}
      </div>
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
