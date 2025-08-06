import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";
import { isStudentProfileComplete } from "../utils/profileCompletion";
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

const provider = new GoogleAuthProvider();

export default function StudentSignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!email.endsWith("@ucsc.edu")) {
        await user.delete();
        await auth.signOut();
        setError("You must use a valid @ucsc.edu email to sign up.");
        return;
      }
      if (password !== confirmPassword) {
        await user.delete();
        await auth.signOut();
        setError("Passwords do not match.");
        return;
      }
      // Store user type in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        type: "student"
      });
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user.email.endsWith("@ucsc.edu")) {
        await user.delete();
        await auth.signOut();
        setError("You must use a valid @ucsc.edu email to sign up.");
        return;
      }
      // Check if user doc exists
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists()) {
        await setDoc(userDoc, {
          email: user.email,
          type: "student"
        });
      }
      navigate("/profile");
    } catch (err) {
      setError("Google Sign Up failed: " + err.message);
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
                <h2 className="text-primary fw-bold mb-4">Student Sign Up</h2>

                <Button 
                  variant="outline-primary" 
                  size="lg" 
                  className="w-100 mb-3"
                  onClick={handleGoogleSignUp}
                >
                  <i className="fab fa-google me-2"></i>
                  Sign up with Google
                </Button>

                <hr className="my-4" />

                <Form onSubmit={handleSignUp}>
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

                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Sign Up
                  </Button>
                </Form>

                <Button
                  variant="link"
                  onClick={() => navigate("/student-login")}
                  className="text-decoration-none"
                >
                  Already have an account? Log in here
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
