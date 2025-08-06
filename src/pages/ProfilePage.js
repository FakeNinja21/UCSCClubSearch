import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import NavBar from "../components/StudentNavigation";
import availableTags from "../data/availableTags";
import { onAuthStateChanged } from "firebase/auth";
import { isStudentProfileComplete } from "../utils/profileCompletion";
import { Container, Card, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';

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
    const [saveSuccess, setSaveSuccess] = useState(false);

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
                        
                        // Check profile completion on load
                        const complete = await isStudentProfileComplete(user.uid);
                        setProfileComplete(complete);
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
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
                
                // Recheck profile completion after saving
                const complete = await isStudentProfileComplete(user.uid);
                setProfileComplete(complete);
            } catch (err) {
                setError("Error saving profile. Please try again.");
                console.error("Error updating document: ", err);
            }
        }
    };

    const handleAddInterest = (interest) => {
        if (!interests.includes(interest)) {
            setInterests([...interests, interest]);
        }
    };

    const handleRemoveInterest = (interest) => {
        setInterests(interests.filter(i => i !== interest));
    };

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading profile...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <Alert variant="danger" className="text-center">
                {error}
            </Alert>
        </div>
    );

    return (
        <>
            <NavBar />
            <Container className="py-4" style={{ marginTop: '80px' }}>
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Card className="shadow-sm border-0">
                            <Card.Header className="bg-primary text-white">
                                <h2 className="mb-0 fw-bold">👤 Profile</h2>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {!profileComplete && (
                                    <Alert variant="warning" className="mb-4">
                                        <strong>⚠️ Profile Incomplete</strong><br />
                                        Please complete the following information to access all features of the app:
                                        <ul className="mb-0 mt-2">
                                            {!name.trim() && <li>Add your name</li>}
                                            {!major.trim() && <li>Add your major</li>}
                                        </ul>
                                    </Alert>
                                )}

                                {saveSuccess && (
                                    <Alert variant="success" className="mb-4">
                                        Profile saved successfully!
                                    </Alert>
                                )}

                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={auth.currentUser.email}
                                                    disabled
                                                    className="bg-light"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter your name"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">Major</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={major}
                                                    onChange={(e) => setMajor(e.target.value)}
                                                    placeholder="Enter your major"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold">Notification Settings</Form.Label>
                                                <div>
                                                    <Form.Check
                                                        type="radio"
                                                        name="notificationPreference"
                                                        id="notify-all"
                                                        value="all"
                                                        checked={notificationPreference === 'all'}
                                                        onChange={(e) => setNotificationPreference(e.target.value)}
                                                        label="All Club Events"
                                                    />
                                                    <Form.Check
                                                        type="radio"
                                                        name="notificationPreference"
                                                        id="notify-joined"
                                                        value="joined"
                                                        checked={notificationPreference === 'joined'}
                                                        onChange={(e) => setNotificationPreference(e.target.value)}
                                                        label="Only Events from My Joined Clubs"
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Interests</Form.Label>
                                        <div className="mb-3">
                                            {interests.map((interest, index) => (
                                                <Badge 
                                                    key={index} 
                                                    bg="primary" 
                                                    className="me-2 mb-2"
                                                >
                                                    {interest}
                                                    <Button
                                                        variant="link"
                                                        className="text-white text-decoration-none p-0 ms-2"
                                                        onClick={() => handleRemoveInterest(interest)}
                                                    >
                                                        ×
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <Form.Select
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAddInterest(e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        >
                                            <option value="">Add an interest...</option>
                                            {availableTags.filter(tag => !interests.includes(tag)).map((tag, index) => (
                                                <option key={index} value={tag}>{tag}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    {joinedClubs.length > 0 && (
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold">Joined Clubs</Form.Label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {joinedClubs.map((club, index) => (
                                                    <Badge key={index} bg="success">
                                                        {club}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </Form.Group>
                                    )}

                                    <div className="text-center">
                                        <Button 
                                            variant="primary" 
                                            size="lg" 
                                            onClick={handleSaveChanges}
                                        >
                                            Save All Changes
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default ProfilePage;