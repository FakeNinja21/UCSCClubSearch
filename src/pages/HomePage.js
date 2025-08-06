import React from 'react';
import { useNavigate } from 'react-router-dom';
import clubLogo from '../assets/club_logo.png';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)' }}>
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5 text-center">
                <h1 className="text-primary fw-bold mb-3">Welcome to UCSC Club Search</h1>
                <img src={clubLogo} alt="UCSC Club Search Logo" 
                     className="img-fluid mb-4" style={{ maxWidth: '130px' }} />
                <p className="text-muted mb-4 fs-5">
                  Find, join, and manage UCSC clubs and events. Please select your role to continue:
                </p>
                
                <Row className="g-4">
                  {/* Student Section */}
                  <Col md={6}>
                    <Card className="h-100 border-0" style={{ backgroundColor: '#e5f0ff' }}>
                      <Card.Body className="p-4">
                        <h2 className="text-primary fw-bold mb-3">I am a Student</h2>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button variant="primary" size="lg" 
                                  onClick={() => navigate('/student-signup')}>
                            Student Sign Up
                          </Button>
                          <Button variant="outline-primary" size="lg" 
                                  onClick={() => navigate('/student-login')}>
                            Student Login
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  {/* Club Section */}
                  <Col md={6}>
                    <Card className="h-100 border-0" style={{ backgroundColor: '#fffbe5' }}>
                      <Card.Body className="p-4">
                        <h2 className="fw-bold mb-3" style={{ color: '#B8860B' }}>I represent a Club</h2>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button variant="warning" size="lg" 
                                  onClick={() => navigate('/club-signup')}>
                            Club Sign Up
                          </Button>
                          <Button variant="outline-warning" size="lg" 
                                  onClick={() => navigate('/club-login')}>
                            Club Login
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage; 