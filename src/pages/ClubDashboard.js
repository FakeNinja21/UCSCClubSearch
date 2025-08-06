import React, { useEffect, useState } from 'react';
import ClubNavigation from '../components/ClubNavigation';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { isEventArchived } from '../utils/eventArchiver';
import { Container, Card, Button, Form, Table, ProgressBar, Row, Col, Badge, Modal, Alert } from 'react-bootstrap';

export default function ClubDashboard() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [attendeesInfo, setAttendeesInfo] = useState({});
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [eventFilter, setEventFilter] = useState('active'); // 'active' or 'archived'
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      setLoadingEvents(true);
      try {
        const q = query(collection(db, 'events'), where('clubId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventList);
        const attendeesData = {};
        for (const event of eventList) {
          if (Array.isArray(event.attendees) && event.attendees.length > 0) {
            const users = await Promise.all(event.attendees.map(async (uid) => {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                return { email: data.email, major: data.major || 'N/A' };
              } else {
                return { email: 'Unknown', major: 'N/A' };
              }
            }));
            attendeesData[event.id] = users;
          } else {
            attendeesData[event.id] = [];
          }
        }
        setAttendeesInfo(attendeesData);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
      setLoadingEvents(false);
    };
    fetchEvents();
  }, [currentUser]);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!currentUser) return;
      setLoadingFollowers(true);
      try {
        const clubDocRef = doc(db, 'clubs', currentUser.uid);
        const clubDocSnap = await getDoc(clubDocRef);
        if (clubDocSnap.exists()) {
          const data = clubDocSnap.data();
          const followerIds = Array.isArray(data.followers) ? data.followers : [];
          const followerData = await Promise.all(followerIds.map(async (uid) => {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              const user = userDoc.data();
              return { email: user.email, major: user.major || 'N/A' };
            } else {
              return { email: 'Unknown', major: 'N/A' };
            }
          }));
          setFollowers(followerData);
        } else {
          setFollowers([]);
        }
      } catch (err) {
        console.error('Error fetching followers:', err);
        setFollowers([]);
      }
      setLoadingFollowers(false);
    };
    fetchFollowers();
  }, [currentUser]);

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setDeleteModalShow(true);
    setDeleteError('');
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      await deleteDoc(doc(db, 'events', eventToDelete.id));
      
      // Remove the event from local state
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id));
      
      // Remove attendees info for this event
      setAttendeesInfo(prev => {
        const newAttendeesInfo = { ...prev };
        delete newAttendeesInfo[eventToDelete.id];
        return newAttendeesInfo;
      });
      
      setDeleteModalShow(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      setDeleteError('Failed to delete event. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    eventFilter === 'active' ? !isEventArchived(event) : isEventArchived(event)
  );

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)' }}>
      <ClubNavigation />
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="g-4">
          {/* Event Dashboard (Left) */}
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 fw-bold">Event Dashboard</h2>
              </Card.Header>
              <Card.Body>
                {/* Filter Dropdown */}
                <div className="mb-4">
                  <Form.Label className="fw-bold">Show:</Form.Label>
                  <Form.Select
                    value={eventFilter}
                    onChange={e => setEventFilter(e.target.value)}
                    className="w-auto"
                  >
                    <option value="active">Active Events</option>
                    <option value="archived">Archived Events</option>
                  </Form.Select>
                </div>

                {loadingEvents ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No {eventFilter} events found.</p>
                  </div>
                ) : (
                  <div>
                    {filteredEvents.map(event => (
                      <Card key={event.id} className="mb-3 border-start border-primary border-4">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <Card.Title className="mb-0 text-primary fw-bold">
                              {event.eventName || 'Untitled Event'}
                            </Card.Title>
                            <div className="d-flex gap-2 align-items-center">
                              <Badge bg="warning" text="dark">
                                Signups: {Array.isArray(event.attendees) ? event.attendees.length : 0}
                              </Badge>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteEvent(event)}
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <strong>Event Details:</strong>
                            <div className="row mt-2">
                              <div className="col-md-6">
                                <small className="text-muted">
                                  <strong>Date:</strong> {event.date}<br/>
                                  <strong>Time:</strong> {event.startTime} - {event.endTime}<br/>
                                  <strong>Location:</strong> {event.location}
                                </small>
                              </div>
                              <div className="col-md-6">
                                <small className="text-muted">
                                  <strong>Open to:</strong> {event.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}<br/>
                                  <strong>Status:</strong> {isEventArchived(event) ? 'Archived' : 'Active'}
                                </small>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <strong>Attendees:</strong>
                            {attendeesInfo[event.id] && attendeesInfo[event.id].length > 0 ? (
                              <Table size="sm" className="mt-2">
                                <thead>
                                  <tr>
                                    <th>Email</th>
                                    <th>Major</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attendeesInfo[event.id].map((user, idx) => (
                                    <tr key={idx}>
                                      <td>{user.email}</td>
                                      <td className="text-muted">{user.major}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <p className="text-muted mb-0">No attendees yet.</p>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Statistics Dashboard (Right) */}
          <Col lg={4}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 fw-bold">Statistics</h2>
              </Card.Header>
              <Card.Body>
                {loadingFollowers ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading followers...</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h5>Followers</h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="fw-bold me-2">{followers.length}</span>
                        <span className="text-muted">total followers</span>
                      </div>
                      <ProgressBar 
                        now={followers.length} 
                        max={100} 
                        className="mb-3"
                        label={`${followers.length} followers`}
                      />
                    </div>

                    <div className="mb-4">
                      <h5>Event Statistics</h5>
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="border rounded p-3">
                            <h4 className="text-primary mb-1">{filteredEvents.length}</h4>
                            <small className="text-muted">{eventFilter} events</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded p-3">
                            <h4 className="text-success mb-1">
                              {filteredEvents.reduce((total, event) => 
                                total + (Array.isArray(event.attendees) ? event.attendees.length : 0), 0
                              )}
                            </h4>
                            <small className="text-muted">total signups</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {followers.length > 0 && (
                      <div>
                        <h5>Recent Followers</h5>
                        <div className="list-group list-group-flush">
                          {followers.slice(0, 5).map((follower, idx) => (
                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                <div className="fw-bold">{follower.email}</div>
                                <small className="text-muted">Major: {follower.major}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold">⚠️ Delete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && (
            <Alert variant="danger" className="mb-3">
              {deleteError}
            </Alert>
          )}
          <p>
            Are you sure you want to delete <strong>"{eventToDelete?.eventName}"</strong>?
          </p>
          <p className="text-muted">
            This action cannot be undone. All attendee signups will be lost.
          </p>
          {eventToDelete && Array.isArray(eventToDelete.attendees) && eventToDelete.attendees.length > 0 && (
            <Alert variant="warning">
              <strong>Warning:</strong> This event has {eventToDelete.attendees.length} attendee(s) signed up.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalShow(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteEvent}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Event'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 