import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import NavBar from "../components/StudentNavigation";
import availableTags from "../data/availableTags";

const styles = {
  container: {
    margin: "auto",
    marginTop: "3rem",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "1rem",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
  },
  section: {
    marginBottom: "1rem",
  },
  label: {
    fontWeight: "bold",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    padding: "0.3rem 0.6rem",
    borderRadius: "1rem",
    marginRight: "0.5rem",
    marginBottom: "0.5rem",
  },
  tagRemove: {
    marginLeft: "0.4rem",
    cursor: "pointer",
    color: "red",
    fontWeight: "bold",
  },
  addTagSection: {
    marginTop: "0.5rem",
    display: "flex",
    gap: "0.5rem",
  },
  editBtn: {
    marginLeft: "0.5rem",
    padding: "0.3rem 0.5rem",
    fontSize: "0.8rem",
    backgroundColor: "#3182ce",
    color: "white",
    border: "none",
    borderRadius: "0.3rem",
    cursor: "pointer",
  },
};

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [major, setMajor] = useState("");
  const [editingMajor, setEditingMajor] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState("");
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
          return;
        }
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (!didCancel) {
            setUserData(data);
            setMajor(data.major || "");
            setInterests(data.tags || []);
            setLoading(false);
          }
        } else {
          setError("User profile not found.");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load profile. Please try again later.");
        setLoading(false);
      }
    };
    fetchUserData();
    // Timeout fallback
    const timeout = setTimeout(() => {
      if (loading && !userData) {
        setError("Profile loading timed out. Please refresh the page.");
        setLoading(false);
      }
    }, 8000);
    return () => {
      didCancel = true;
      clearTimeout(timeout);
    };
  }, []);

  const handleMajorSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { major });
      setEditingMajor(false);
    }
  };

  const handleRemoveInterest = async (interestToRemove) => {
    const updated = interests.filter((tag) => tag !== interestToRemove);
    setInterests(updated);

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { tags: updated }); // still updating `tags` in Firestore
    }
  };

  const handleAddInterest = async () => {
    if (!selectedInterest || interests.includes(selectedInterest)) return;
    const updated = [...interests, selectedInterest];
    setInterests(updated);

    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { tags: updated });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>{error}</div>;
  if (!userData) return null;

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <h2>
          <span role="img" aria-label="profile">
            👤
          </span>{" "}
          Profile
        </h2>

        <div style={styles.section}>
          <span style={styles.label}>Email:</span> {auth.currentUser.email}
        </div>

        <div style={styles.section}>
          <span style={styles.label}>Type:</span> Student
        </div>

        <div style={styles.section}>
          <span style={styles.label}>Major:</span>{" "}
          {editingMajor ? (
            <>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
              <button onClick={handleMajorSave} style={styles.editBtn}>
                Save
              </button>
            </>
          ) : (
            <>
              {major}{" "}
              <button
                onClick={() => setEditingMajor(true)}
                style={styles.editBtn}
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>

        <div style={styles.section}>
          <span style={styles.label}>Topics of Interest:</span>
          <div>
            {interests.map((tag, idx) => (
              <span key={idx} style={{ ...styles.tag, position: 'relative' }}>
                {tag}
                <span
                  style={{
                    marginLeft: '0.4rem',
                    cursor: 'pointer',
                    color: '#003B5C',
                    fontWeight: 'bold',
                    fontSize: 15,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  className="tag-remove-btn"
                  onClick={() => handleRemoveInterest(tag)}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
          <div style={styles.addTagSection}>
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
            >
              <option value="">Select a topic to add</option>
              {availableTags
                .filter((tag) => !interests.includes(tag))
                .map((tag, idx) => (
                  <option key={idx} value={tag}>
                    {tag}
                  </option>
                ))}
            </select>
            <button onClick={handleAddInterest} style={styles.editBtn}>
              + Add Tag
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .tag-remove-btn:hover, .tag-remove-btn:focus {
      opacity: 1 !important;
    }
    .tag-remove-btn {
      opacity: 0;
      pointer-events: auto;
    }
    span[style*='relative']:hover .tag-remove-btn {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}
