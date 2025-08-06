import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/"); // Go to HomePage
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand className="fw-bold">UCSC Club Search</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/notifications")} className="d-flex align-items-center">
              🔔 Notifications
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/browse-clubs")} className="d-flex align-items-center">
              🔍 Browse Clubs
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/calendar")} className="d-flex align-items-center">
              📅 Calendar
            </Nav.Link>
            <Nav.Link onClick={() => navigate("/profile")} className="d-flex align-items-center">
              👤 Profile
            </Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-light" onClick={handleLogout}>
              🚪 Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
