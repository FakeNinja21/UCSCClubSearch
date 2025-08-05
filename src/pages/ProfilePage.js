import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import NavBar from "../components/StudentNavigation";
import availableTags from "../data/availableTags";
import { onAuthStateChanged } from "firebase/auth";
import { isStudentProfileComplete } from "../utils/profileCompletion";

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
  // ... other styles
};

function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState("");
    const [major, setMajor] = useState("");
    const [interests, setInterests] = useState([]);
    const [notificationPreference, setNotificationPreference] = useState('all');
    const [joinedClubs, setJoinedClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setLoading(false);
                setError("You must be logged in to view your profile.");
                return;
            }
            const fetchUserData = async () => {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                                            const data = userSnap.data();
                    setUserData(data);
                    setName(data.name || "");
                    setMajor(data.major || "");
                    setInterests(data.tags || []);
                    setNotificationPreference(data.notificationPreference || 'all');
                    setJoinedClubs(Array.isArray(data.joinedClubs) ? data.joinedClubs : []);
                    
                    // Don't check profile completion on load - only check after saving
                    setProfileComplete(false);
                } else {
                    setError("User profile not found.");
                }
                } catch (err) {
                    setError("Failed to load profile.");
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        });
        return () => unsubscribe();
    }, []);

    const handleSaveChanges = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, "users", user.uid);
            try {
                await updateDoc(userRef, {
                    name: name,
                    major: major,
                    tags: interests,
                    notificationPreference: notificationPreference,
                });
                alert("Profile saved successfully!");
                
                // Recheck profile completion after saving
                const complete = await isStudentProfileComplete(user.uid);
                setProfileComplete(complete);
            } catch (err) {
                alert("Error saving profile. Please try again.");
                console.error("Error updating document: ", err);
            }
        }
    };

    // ... other handler functions like handleAddInterest, etc. ...

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>{error}</div>;

    return (
        <>
            <NavBar />
            <div style={styles.container}>
                <h2>👤 Profile</h2>
                {!profileComplete && (
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        color: '#856404'
                    }}>
                        <strong>⚠️ Profile Incomplete</strong><br />
                        Please complete the following information to access all features of the app:
                        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                            {!name.trim() && <li>Add your name</li>}
                            {!major.trim() && <li>Add your major</li>}
                        </ul>
                    </div>
                )}
                <div style={styles.section}>
                    <span style={styles.label}>Email:</span> {auth.currentUser.email}
                </div>
                <div style={styles.section}>
                    <span style={styles.label}>Name:</span>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }} />
                </div>
                <div style={styles.section}>
                    <span style={styles.label}>Major:</span>
                    <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }} />
                </div>
                {/* Notification Settings Section */}
                <div style={styles.section}>
                    <span style={styles.label}>Notification Settings:</span>
                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ marginRight: '15px' }}>
                            <input type="radio" value="all" checked={notificationPreference === 'all'} onChange={(e) => setNotificationPreference(e.target.value)} />
                            All Club Events
                        </label>
                        <label>
                            <input type="radio" value="joined" checked={notificationPreference === 'joined'} onChange={(e) => setNotificationPreference(e.target.value)} />
                            Only Events from My Joined Clubs
                        </label>
                    </div>
                </div>
                {/* ... other sections for interests and joined clubs ... */}
                <div style={{ ...styles.section, marginTop: '2rem', textAlign: 'center' }}>
                    <button onClick={handleSaveChanges} style={{...styles.editBtn, padding: '10px 20px', fontSize: '1rem' }}>
                        Save All Changes
                    </button>
                </div>
            </div>
        </>
    );
}

export default ProfilePage;