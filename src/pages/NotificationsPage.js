// pages/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import StudentNavigation from "../components/StudentNavigation";
import { getEventsForStudent, auth, db } from '../firebase'; 
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import availableTags from '../data/availableTags';
import { Container, Card, Button, Form, Row, Col, Badge, Alert } from 'react-bootstrap';

export default function NotificationsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [userTags, setUserTags] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [user, setUser] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserTagsAndClubs(user);
      } else {
        setUserTags([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserTagsAndClubs = async (currentUser) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserTags(Array.isArray(data.tags) ? data.tags.filter(tag => availableTags.includes(tag)) : []);
        setJoinedClubs(Array.isArray(data.joinedClubs) ? data.joinedClubs : []);
      }
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching user tags and clubs:', error);
    }
  };

  useEffect(() => {
    if (!user) {
        setLoading(false);
        setEvents([]);
        return;
    };

    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Using the new function with the student's ID
        const eventList = await getEventsForStudent(user.uid);
        setEvents(eventList);
      } catch (err) {
        console.error("Error fetching events: ", err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]); // Re-fetch when the user logs in/out

  const handleSignUp = async (eventId) => {
    if (!user) return;
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        attendees: arrayUnion(user.uid)
      });
      setEvents(prevEvents => prevEvents.map(ev =>
        ev.id === eventId
          ? { ...ev, attendees: Array.isArray(ev.attendees) ? [...ev.attendees, user.uid] : [user.uid] }
          : ev
      ));
    } catch (err) {
      alert('Failed to sign up for event.');
      console.error(err);
    }
  };

  const handleRemoveSignup = async (eventId) => {
    if (!user) return;
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        attendees: arrayRemove(user.uid)
      });
      setEvents(prevEvents => prevEvents.map(ev =>
        ev.id === eventId
          ? { ...ev, attendees: Array.isArray(ev.attendees) ? ev.attendees.filter(uid => uid !== user.uid) : [] }
          : ev
      ));
    } catch (err) {
      alert('Failed to remove signup.');
      console.error(err);
    }
  };

  // Filtering logic
  const filteredEvents = events.filter(event => {
    // Always show if open to everyone
    if (event.openTo === 'everyone') return true;
    // Otherwise, only show if the user has joined the club
    return joinedClubs && joinedClubs.includes(event.clubName);
  });

  const renderEvents = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading notifications...</p>
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      );
    }
    if (filteredEvents.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          No event notifications found for this filter.
        </Alert>
      );
    }
    return (
      <Row className="g-4">
        {filteredEvents.map(event => {
          const alreadySignedUp = Array.isArray(event.attendees) && user && event.attendees.includes(user.uid);
          return (
            <Col key={event.id} lg={4} md={6}>
              <Card 
                className="h-100 shadow-sm border-0" 
                style={{ backgroundColor: event.bgColor || '#fff' }}
              >
                <Card.Body className="p-4">
                  <Card.Title className="text-center fw-bold text-primary mb-3">
                    {event.eventName}
                  </Card.Title>
                  
                  {event.bannerUrl && (
                    <img 
                      src={event.bannerUrl} 
                      alt="Event Banner" 
                      className="img-fluid rounded mb-3"
                      style={{ maxHeight: '160px', objectFit: 'cover' }}
                    />
                  )}
                  
                  {Array.isArray(event.tags) && event.tags.length > 0 && (
                    <div className="mb-3 text-center">
                      {event.tags.map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          bg="light" 
                          className="me-1 mb-1"
                          style={{ color: '#003B5C' }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <strong>Hosted by:</strong> {event.clubName}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Description:</strong> {event.description}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Date:</strong> {event.date}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Time:</strong> {event.startTime} - {event.endTime}
                  </div>
                  
                  <div className="mb-2">
                    <strong>Location:</strong> {event.location}
                  </div>
                  
                  {event.zoomLink && (
                    <div className="mb-2">
                      <strong>Zoom Link:</strong> <a href={event.zoomLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{event.zoomLink}</a>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <strong>Who can attend:</strong> {event.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}
                  </div>
                  
                  <Button
                    variant={alreadySignedUp ? "outline-danger" : "primary"}
                    className="w-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (alreadySignedUp) {
                        handleRemoveSignup(event.id);
                      } else {
                        handleSignUp(event.id);
                      }
                    }}
                  >
                    {alreadySignedUp ? 'Remove Signup' : 'Sign Up for Event'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)' }}>
      <StudentNavigation />
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="mb-4">
          <h2 className="text-primary fw-bold mb-3">Notifications</h2>
          <div className="d-flex align-items-center gap-3">
            <Form.Group className="mb-0">
              <Form.Label className="fw-bold me-2">Filter:</Form.Label>
              <Form.Select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="all">All events</option>
                <option value="bytag">By tag</option>
              </Form.Select>
            </Form.Group>
          </div>
        </Row>
        {renderEvents()}
      </Container>
    </div>
  );
}