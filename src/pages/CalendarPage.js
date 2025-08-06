import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StudentNavigation from '../components/StudentNavigation';
import { getEvents } from '../firebase';
import { Container, Card, Button, Form, Modal, Row, Col, Badge, Offcanvas, Alert } from 'react-bootstrap';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', followed
  const [userTags, setUserTags] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserDataAndClubs(user);
      } else {
        setUserTags([]);
        setJoinedClubs([]);
        setSelectedClubs([]);
        setFilter('all');
      }
    });

    return () => unsubscribe();
  }, []);

  // Keep selectedClubs in sync with joinedClubs
  useEffect(() => {
    if (!Array.isArray(joinedClubs) || !Array.isArray(selectedClubs)) return;
    const filteredSelected = selectedClubs.filter(clubName => joinedClubs.includes(clubName));
    if (filteredSelected.length !== selectedClubs.length) {
      setSelectedClubs(filteredSelected);
      saveSelectedClubs(filteredSelected);
    }
  }, [joinedClubs]);

  // Fetch user data and clubs
  const fetchUserDataAndClubs = async (currentUser) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserTags(Array.isArray(data.tags) ? data.tags : []);
        setJoinedClubs(Array.isArray(data.joinedClubs) ? data.joinedClubs : []);
        setSelectedClubs(Array.isArray(data.selectedCalendarClubs) ? data.selectedCalendarClubs : []);
        // Load the saved filter preference
        setFilter(data.calendarFilter || 'all');
      }
      // Fetch all clubs and their tags
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching user data and clubs:', error);
    }
  };

  // Save selected clubs to user profile
  const saveSelectedClubs = async (newSelectedClubs) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        selectedCalendarClubs: newSelectedClubs
      });
    } catch (error) {
      console.error('Error saving selected clubs:', error);
    }
  };

  // Save filter preference to user profile
  const saveFilterPreference = async (newFilter) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        calendarFilter: newFilter
      });
    } catch (error) {
      console.error('Error saving filter preference:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    saveFilterPreference(newFilter);
  };

  const handleClubToggle = (clubName) => {
    const newSelected = selectedClubs.includes(clubName)
      ? selectedClubs.filter(name => name !== clubName)
      : [...selectedClubs, clubName];
    setSelectedClubs(newSelected);
    saveSelectedClubs(newSelected);
  };

  const handleSelectAll = () => {
    const allJoined = clubs.filter(club => joinedClubs.includes(club.name)).map(club => club.name);
    setSelectedClubs(allJoined);
    saveSelectedClubs(allJoined);
  };

  const handleSelectNone = () => {
    setSelectedClubs([]);
    saveSelectedClubs([]);
  };

  // Fetch events with signup status
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Transform events for calendar display
        const calendarEvents = eventsList.map(event => {
          const start = new Date(`${event.date}T${event.startTime}`);
          const end = new Date(`${event.date}T${event.endTime}`);
          
          return {
            ...event,
            start,
            end,
            title: event.eventName,
            desc: event.description,
            attendees: event.attendees || []
          };
        });
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'followed') {
      return selectedClubs.includes(event.clubName);
    }
    if (filter === 'signedup') {
      return event.attendees && event.attendees.includes(user?.uid);
    }
    return true;
  });

  // Handle event signup/signout
  const handleEventSignup = async (eventId, isSigningUp = true) => {
    if (!user) return;
    
    // Find the event to check eligibility
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Check if user is eligible to sign up
    if (isSigningUp && !isUserEligibleForEvent(event)) {
      setSignupError('You are not eligible to sign up for this event. Please join the club first or check the event requirements.');
      return;
    }
    
    setSignupLoading(true);
    setSignupError('');
    setSignupSuccess('');
    
    try {
      const eventRef = doc(db, 'events', eventId);
      
      if (isSigningUp) {
        await updateDoc(eventRef, {
          attendees: arrayUnion(user.uid)
        });
        setSignupSuccess('Successfully signed up for the event!');
      } else {
        await updateDoc(eventRef, {
          attendees: arrayRemove(user.uid)
        });
        setSignupSuccess('Successfully removed signup for the event!');
      }
      
      // Update the local events state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? {
                ...event,
                attendees: isSigningUp 
                  ? [...(event.attendees || []), user.uid]
                  : (event.attendees || []).filter(id => id !== user.uid)
              }
            : event
        )
      );
      
      // Update selected event if it's the same one
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          attendees: isSigningUp 
            ? [...(prev.attendees || []), user.uid]
            : (prev.attendees || []).filter(id => id !== user.uid)
        }));
      }
      
    } catch (error) {
      console.error('Error updating event signup:', error);
      setSignupError('Failed to update signup. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  // Check if user is eligible to sign up for an event
  const isUserEligibleForEvent = (event) => {
    // If event is open to everyone, user is eligible
    if (event.openTo === 'everyone') {
      return true;
    }
    
    // If event is for club members only, check if user has joined the club
    if (event.openTo === 'members') {
      return joinedClubs.includes(event.clubName);
    }
    
    // Default to not eligible if openTo is not recognized
    return false;
  };

  // Check if user is signed up for an event
  const isUserSignedUp = (event) => {
    return event.attendees && event.attendees.includes(user?.uid);
  };

  // Custom event style for color coding
  const eventStyleGetter = (event) => {
    const isSignedUp = isUserSignedUp(event);
    return {
      style: {
        backgroundColor: isSignedUp ? '#28a745' : (event.bgColor || '#e5f0ff'),
        color: isSignedUp ? '#fff' : '#003B5C',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 600,
        fontSize: 15,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }
    };
  };

  return (
    <div className="min-vh-100" style={{ background: '#f7f7fa' }}>
      <StudentNavigation />
      <Container className="py-4" style={{ marginTop: '80px' }}>
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="text-primary fw-bold mb-0">📅 Club Events Calendar</h2>
              <Button 
                variant="primary"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="d-lg-none"
              >
                {sidebarOpen ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </Col>
        </Row>
        
        <Row>
          {/* Calendar */}
          <Col lg={sidebarOpen ? 8 : 12}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading events...</p>
              </div>
            ) : (
              <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                  <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 700 }}
                    eventPropGetter={eventStyleGetter}
                    popup
                    views={['month', 'week', 'day']}
                    components={{ 
                      event: (props) => <span>{props.title}</span>, 
                      eventWrapper: ({ event, children }) => <div title={event.desc}>{children}</div> 
                    }}
                    tooltipAccessor={null}
                    onSelectEvent={event => setSelectedEvent(event)}
                  />
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Clubs Filter Sidebar */}
          {sidebarOpen && (
            <Col lg={4}>
              <Card className="shadow-sm border-0 sticky-top" style={{ top: '100px' }}>
                <Card.Header className="bg-primary text-white">
                  <h3 className="mb-0 fw-bold">Clubs Joined</h3>
                </Card.Header>
                <Card.Body>
                  {/* Filter Options */}
                  <div className="mb-4">
                    <Form.Label className="fw-bold">Filter Options:</Form.Label>
                    <div className="d-flex flex-column gap-2">
                      <Form.Check
                        type="radio"
                        name="calfilter"
                        id="filter-all"
                        checked={filter === 'all'}
                        onChange={() => handleFilterChange('all')}
                        label="All Clubs"
                      />
                      <Form.Check
                        type="radio"
                        name="calfilter"
                        id="filter-followed"
                        checked={filter === 'followed'}
                        onChange={() => handleFilterChange('followed')}
                        label="Followed Clubs"
                      />
                      <Form.Check
                        type="radio"
                        name="calfilter"
                        id="filter-signedup"
                        checked={filter === 'signedup'}
                        onChange={() => handleFilterChange('signedup')}
                        label="Signed Up Events"
                      />
                    </div>
                  </div>

                  {/* Select All/None buttons and club checkboxes only for Selected Clubs */}
                  {filter === 'followed' && (
                    <>
                      <div className="d-flex gap-2 mb-3">
                        <Button variant="outline-primary" size="sm" onClick={handleSelectAll}>
                          Select All
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={handleSelectNone}>
                          Select None
                        </Button>
                      </div>
                      
                      {/* Club checkboxes - only show joined clubs */}
                      <div className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {clubs.filter(club => joinedClubs.includes(club.name)).map((club) => (
                          <Form.Check
                            key={club.id}
                            type="checkbox"
                            id={`club-${club.id}`}
                            checked={selectedClubs.includes(club.name)}
                            onChange={() => handleClubToggle(club.name)}
                            label={club.name}
                            className="mb-2"
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">
                      <strong>Selected:</strong> {selectedClubs.length} of {clubs.filter(club => joinedClubs.includes(club.name)).length} clubs
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
        
        {/* Event Modal */}
        <Modal show={selectedEvent !== null} onHide={() => setSelectedEvent(null)} size="lg">
          {selectedEvent && (
            <>
              <Modal.Header closeButton>
                <Modal.Title className="text-primary fw-bold">{selectedEvent.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {signupSuccess && (
                  <Alert variant="success" className="mb-3">
                    {signupSuccess}
                  </Alert>
                )}
                
                {signupError && (
                  <Alert variant="danger" className="mb-3">
                    {signupError}
                  </Alert>
                )}
                
                {selectedEvent.bannerUrl && (
                  <img 
                    src={selectedEvent.bannerUrl} 
                    alt="Event Banner" 
                    className="img-fluid rounded mb-3"
                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                  />
                )}
                
                <div className="mb-3">
                  <strong>Hosted by:</strong> {selectedEvent.clubName}
                </div>
                
                <div className="mb-3">
                  <strong>Description:</strong> {selectedEvent.desc}
                </div>
                
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Date:</strong> {selectedEvent.start.toLocaleDateString()}
                    </div>
                    <div className="mb-2">
                      <strong>Start Time:</strong> {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="mb-2">
                      <strong>End Time:</strong> {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>Location:</strong> {selectedEvent.location}
                    </div>
                    {selectedEvent.zoomLink && (
                      <div className="mb-2">
                        <strong>Zoom Link:</strong> <a href={selectedEvent.zoomLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{selectedEvent.zoomLink}</a>
                      </div>
                    )}
                    <div className="mb-2">
                      <strong>Who can attend:</strong> {selectedEvent.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}
                    </div>
                    <div className="mb-2">
                      <strong>Attendees:</strong> {(selectedEvent.attendees || []).length} people signed up
                    </div>
                  </Col>
                </Row>
                
                {Array.isArray(selectedEvent.tags) && selectedEvent.tags.length > 0 && (
                  <div className="mt-3">
                    <strong>Tags:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {selectedEvent.tags.map((tag, idx) => (
                        <Badge key={idx} bg="light" text="dark">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                {isUserSignedUp(selectedEvent) ? (
                  <Button 
                    variant="outline-danger" 
                    onClick={() => handleEventSignup(selectedEvent.id, false)}
                    disabled={signupLoading}
                  >
                    {signupLoading ? 'Removing...' : 'Remove Signup'}
                  </Button>
                ) : isUserEligibleForEvent(selectedEvent) ? (
                  <Button 
                    variant="success" 
                    onClick={() => handleEventSignup(selectedEvent.id, true)}
                    disabled={signupLoading}
                  >
                    {signupLoading ? 'Signing up...' : 'Sign Up for Event'}
                  </Button>
                ) : (
                  <div className="text-center w-100">
                    <p className="text-muted mb-2">
                      {selectedEvent.openTo === 'members' 
                        ? `This event is for ${selectedEvent.clubName} members only. Join the club to sign up!`
                        : 'You are not eligible to sign up for this event.'
                      }
                    </p>
                    {selectedEvent.openTo === 'members' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(null);
                          // Navigate to browse clubs to join the club
                          window.location.href = '/browse-clubs';
                        }}
                      >
                        Browse Clubs
                      </Button>
                    )}
                  </div>
                )}
                <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>
      </Container>
    </div>
  );
};

export default CalendarPage;
