import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, signInStudentWithEmail, signInStudentWithGoogle, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";
import { isStudentProfileComplete } from "../utils/profileCompletion";
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRedirect = async (user) => {
    try {
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.type === "student") {
          // Check if profile is complete
          const profileComplete = await isStudentProfileComplete(user.uid);
          if (profileComplete) {
            navigate("/notifications");
          } else {
            navigate("/profile");
          }
        } else if (userData.type === "club") {
          navigate("/club-dashboard");
        } else {
          navigate("/notifications");
        }
      } else {
        navigate("/notifications");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      navigate("/notifications");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInStudentWithEmail(email, password);
      await handleRedirect(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInStudentWithGoogle();
      const user = result.user;
      if (!user.email.endsWith("@ucsc.edu")) {
        setError("You must use a valid @ucsc.edu email to sign in.");
        return;
      }
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists()) {
        await user.delete();
        await auth.signOut();
        setError("You must sign up before logging in with Google.");
        return;
      }
      await handleRedirect(user);
    } catch (err) {
      setError("Google Sign In failed: " + err.message);
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
                <h2 className="text-primary fw-bold mb-4">Student Login</h2>

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
                      placeholder="UCSC Email"
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
                  onClick={() => navigate("/student-signup")}
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