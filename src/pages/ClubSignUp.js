import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import clubLogo from "../assets/club_logo.png";
import approvedClubEmails from "../data/approvedClubEmails";
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

const provider = new GoogleAuthProvider();

export default function ClubSignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isApprovedEmail = (email) => {
    return approvedClubEmails.includes(email.toLowerCase());
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!isApprovedEmail(email)) {
        await user.delete();
        await auth.signOut();
        setError("This email is not recognized as an official UCSC club.");
        return;
      }

      await setDoc(doc(db, "clubs", user.uid), {
        email,
        type: "club"
      });

      navigate("/club-profile");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email;

      if (!isApprovedEmail(userEmail)) {
        await user.delete();
        await auth.signOut();
        setError("This Google account is not recognized as an official UCSC club.");
        return;
      }

      await setDoc(doc(db, "clubs", user.uid), {
        email: userEmail,
        type: "club"
      });

      navigate("/club-profile");
    } catch (err) {
      setError("Google Sign-Up failed: " + err.message);
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
                <h2 className="text-primary fw-bold mb-4">Club Sign Up</h2>

                <Button 
                  variant="outline-warning" 
                  size="lg" 
                  className="w-100 mb-3"
                  onClick={handleGoogleSignUp}
                >
                  <i className="fab fa-google me-2"></i>
                  Sign up with Google
                </Button>

                <hr className="my-4" />

                <Form onSubmit={handleEmailSignUp}>
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
                    variant="warning" 
                    size="lg" 
                    className="w-100 mb-3"
                  >
                    Sign Up
                  </Button>
                </Form>

                <Button
                  variant="link"
                  onClick={() => navigate("/club-login")}
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
