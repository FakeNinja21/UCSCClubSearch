import React from 'react';
import ClubNavigation from '../components/ClubNavigation';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

const EventPreview = ({ eventData, bannerPreview, onBack, onSubmit, loading, error }) => {
  return (
    <>
      <ClubNavigation />
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 fw-bold text-center">{eventData.eventName}</h2>
              </Card.Header>
              <Card.Body className="p-4">
                {bannerPreview && (
                  <div className="text-center mb-4">
                    <img 
                      src={bannerPreview} 
                      alt="Event Banner" 
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-primary">Club:</strong> {eventData.clubName}
                    </div>
                    <div className="mb-3">
                      <strong className="text-primary">Date:</strong> {eventData.date}
                    </div>
                    <div className="mb-3">
                      <strong className="text-primary">Start Time:</strong> {eventData.startTime}
                    </div>
                    <div className="mb-3">
                      <strong className="text-primary">End Time:</strong> {eventData.endTime}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-primary">Location:</strong> {eventData.location}
                    </div>
                    {eventData.zoomLink && (
                      <div className="mb-3">
                        <strong className="text-primary">Zoom Link:</strong> 
                        <a href={eventData.zoomLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none ms-2">
                          {eventData.zoomLink}
                        </a>
                      </div>
                    )}
                    <div className="mb-3">
                      <strong className="text-primary">Who can attend:</strong> {eventData.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}
                    </div>
                  </Col>
                </Row>
                
                <div className="mb-4">
                  <strong className="text-primary">Description:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {eventData.description}
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger text-center mb-3">
                    {error}
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-primary" 
                    onClick={onBack}
                    size="lg"
                  >
                    ← Back
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={onSubmit}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? 'Posting...' : 'Submit Event'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EventPreview; 