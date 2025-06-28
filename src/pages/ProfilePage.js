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

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setMajor(data.major || "");
          setInterests(data.tags || []); // using `tags` key for compatibility
        }
      }
    };

    fetchUserData();
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

  if (!userData) return <div>Loading...</div>;

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
              <span key={idx} style={styles.tag}>
                {tag}
                <span
                  style={styles.tagRemove}
                  onClick={() => handleRemoveInterest(tag)}
                >
                  ✖
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
