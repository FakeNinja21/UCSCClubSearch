import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';

export default function ClubNavigation() {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      className="shadow-sm"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1030 
      }}
    >
      <Container>
        <Navbar.Brand className="fw-bold">UCSC Club Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => handleNav('/club-profile')} className="d-flex align-items-center">
              👤 Club Profile
            </Nav.Link>
            <Nav.Link onClick={() => handleNav('/club-calendar')} className="d-flex align-items-center">
              📅 Calendar
            </Nav.Link>
            <Nav.Link onClick={() => handleNav('/create-event')} className="d-flex align-items-center">
              ➕ Create Event
            </Nav.Link>
            <Nav.Link onClick={() => handleNav('/club-dashboard')} className="d-flex align-items-center">
              📊 Dashboard
            </Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-light" onClick={() => handleNav('/')}>
              🚪 Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
