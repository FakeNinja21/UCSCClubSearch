import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import NavBar from "../components/StudentNavigation";
import availableTags from "../data/availableTags";
import { onAuthStateChanged } from "firebase/auth";
import { useRef } from "react";

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
  const [authChecked, setAuthChecked] = useState(false);
  const isMounted = useRef(true);
  const [joinedClubs, setJoinedClubs] = useState([]);

  useEffect(() => {
    isMounted.current = true;
    let didCancel = false;
    let retries = 0;
    const maxRetries = 2;
    let unsubscribe;
    setLoading(true);
    setError("");
    unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      if (!user) {
        if (isMounted.current) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
        }
        return;
      }
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (!didCancel && isMounted.current) {
              setUserData(data);
              setMajor(data.major || "");
              setInterests(data.tags || []);
              setJoinedClubs(Array.isArray(data.joinedClubs) ? data.joinedClubs : []);
              setLoading(false);
            }
          } else {
            if (isMounted.current) {
              setError("User profile not found.");
              setLoading(false);
            }
          }
        } catch (err) {
          if (retries < maxRetries) {
            retries++;
            setTimeout(fetchUserData, 1000 * retries); // Exponential backoff
          } else {
            if (isMounted.current) {
              setError("Failed to load profile after several attempts. Please check your connection and try again.");
              setLoading(false);
            }
          }
        }
      };
      fetchUserData();
    });
    return () => {
      didCancel = true;
      isMounted.current = false;
      if (unsubscribe) unsubscribe();
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

  // Remove (leave) a joined club
  const handleRemoveJoinedClub = async (clubName) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const updated = joinedClubs.filter(name => name !== clubName);
    await updateDoc(userRef, { joinedClubs: updated });
    setJoinedClubs(updated);
  };

  if (loading || !authChecked) return <div>Loading...</div>;
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
        {/* Joined Clubs Section */}
        <div style={styles.section}>
          <span style={styles.label}>Joined Clubs:</span>
          <div>
            {joinedClubs.length === 0 ? (
              <span style={{ color: '#888', fontSize: 15 }}>You haven't joined any clubs yet.</span>
            ) : (
              joinedClubs.map((club, idx) => (
                <span key={idx} style={{ ...styles.tag, position: 'relative', backgroundColor: '#e5f0ff', color: '#003B5C', fontWeight: 600 }}>
                  {club}
                  <span
                    style={{
                      marginLeft: '0.4rem',
                      cursor: 'pointer',
                      color: '#c00',
                      fontWeight: 'bold',
                      fontSize: 15,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="tag-remove-btn"
                    onClick={() => handleRemoveJoinedClub(club)}
                  >
                    ×
                  </span>
                </span>
              ))
            )}
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
