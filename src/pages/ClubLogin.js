import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";
import { isClubProfileComplete } from "../utils/profileCompletion";
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

const provider = new GoogleAuthProvider();

export default function ClubLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRedirect = async (user) => {
    try {
      const clubDoc = doc(db, "clubs", user.uid);
      const clubSnap = await getDoc(clubDoc);

      if (clubSnap.exists()) {
        // Check if profile is complete
        const profileComplete = await isClubProfileComplete(user.uid);
        if (profileComplete) {
          navigate("/club-dashboard");
        } else {
          navigate("/club-profile");
        }
      } else {
        navigate("/notifications"); // fallback in case data is missing
      }
    } catch (err) {
      console.error("Error checking user type:", err);
      navigate("/notifications");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRedirect(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = doc(db, "clubs", user.uid);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists()) {
        await user.delete();
        await auth.signOut();
        setError("You must sign up before logging in with Google.");
        return;
      }

      await handleRedirect(user);
    } catch (err) {
      setError("Google Login failed: " + err.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)' }}>
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5 text-center">
                <img src={clubLogo} alt="Club Logo" className="img-fluid mb-4" style={{ maxWidth: '120px' }} />
                <h2 className="text-primary fw-bold mb-4">Club Login</h2>

                <Button 
                  variant="outline-primary" 
                  size="lg" 
                  className="w-100 mb-3"
                  onClick={handleGoogleLogin}
                >
                  <i className="fab fa-google me-2"></i>
                  Log in with Google
                </Button>

                <hr className="my-4" />

                <Form onSubmit={handleEmailLogin}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder="Club Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      size="lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      size="lg"
                    />
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg" 
                    className="w-100 mb-3"
                  >
                    Log In
                  </Button>
                </Form>

                <Button
                  variant="link"
                  onClick={() => navigate("/club-signup")}
                  className="text-decoration-none"
                >
                  Don't have an account? Sign up here
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
