import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import EventPreview from './EventPreview';
import ClubNavigation from '../components/ClubNavigation';
import availableTags from '../data/availableTags';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Card, Button, Form, Modal, Row, Col, Alert, Badge } from 'react-bootstrap';

const localizer = momentLocalizer(moment);

const CreateEventPage = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [openTo, setOpenTo] = useState('everyone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = preview
  const [date, setDate] = useState(null); // Change to Date object
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubNameLoading, setClubNameLoading] = useState(true);
  const [clubTags, setClubTags] = useState([]);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [conflictEvent, setConflictEvent] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const maxTitleWords = 10;

  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  React.useEffect(() => {
    const fetchClubNameAndTags = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'clubs', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClubName(docSnap.data().name || '');
          setClubTags(Array.isArray(docSnap.data().tags) ? docSnap.data().tags : []);
        }
      }
      setClubNameLoading(false);
    };
    fetchClubNameAndTags();
  }, []);

  // Generate a pastel color palette for tags
  const pastelColors = [
    '#ffe5e5', // red
    '#e5ffe5', // green
    '#e5f0ff', // blue
    '#fffbe5', // yellow
    '#fff0e5', // orange
    '#f3e5ff', // purple
    '#ffe5f0', // pink
    '#e5fff6', // teal
    '#f5e5ff', // lavender
    '#e5fff0', // mint
    '#f5ffe5', // light lime
    '#e5eaff', // periwinkle
    '#fff5e5', // peach
    '#f0f0f0', // fallback gray
  ];
  // Map each tag to a color
  const tagColorMap = availableTags.reduce((map, tag, idx) => {
    map[tag] = pastelColors[idx % pastelColors.length];
    return map;
  }, {});

  // Get club tags (if any) from currentUser or club profile (for now, fallback to 'Other')
  // You may want to fetch club tags from Firestore if not available in currentUser
  const firstTag = clubTags[0] || availableTags[0];
  const bgColor = tagColorMap[firstTag] || '#fff';

  const maxWords = 50;
  const wordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length;

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);
    if (value.trim() === '' || words.length <= maxWords) {
      setDescription(value);
    } else {
      setDescription(words.slice(0, maxWords).join(' '));
    }
  };

  const handleFormNext = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!eventName.trim()) {
      setError('Please enter an event title');
      return;
    }
    
    if (!date && !selectedTimeRange) {
      setError('Please select a date and time for your event');
      return;
    }
    
    if (!startTime || !endTime) {
      setError('Please enter start and end times');
      return;
    }
    
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    // Check for time conflicts
    const eventStart = moment(`${date ? moment(date).format('YYYY-MM-DD') : moment(selectedTimeRange.start).format('YYYY-MM-DD')}T${startTime}`);
    const eventEnd = moment(`${date ? moment(date).format('YYYY-MM-DD') : moment(selectedTimeRange.end).format('YYYY-MM-DD')}T${endTime}`);
    
    const hasConflict = clubEvents.some(event => {
      const existingStart = moment(event.start);
      const existingEnd = moment(event.end);
      return eventStart.isBefore(existingEnd) && eventEnd.isAfter(existingStart);
    });

    if (hasConflict) {
      setConflictEvent(clubEvents.find(event => {
        const existingStart = moment(event.start);
        const existingEnd = moment(event.end);
        return eventStart.isBefore(existingEnd) && eventEnd.isAfter(existingStart);
      }));
      setShowConflictModal(true);
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const uploadToCloudinary = async (file) => {
    const url = 'https://api.cloudinary.com/v1_1/dwo1u3dhn/image/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ucsc_club_upload');
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Cloudinary upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate required data
      if (!eventName.trim()) {
        throw new Error('Event name is required');
      }
      
      if (!date && !selectedTimeRange) {
        throw new Error('Date is required');
      }
      
      if (!startTime || !endTime) {
        throw new Error('Start and end times are required');
      }
      
      if (!location.trim()) {
        throw new Error('Location is required');
      }

      let bannerUrl = null;
      if (banner) {
        try {
          bannerUrl = await uploadToCloudinary(banner);
        } catch (uploadError) {
          console.error('Banner upload failed:', uploadError);
          // Continue without banner if upload fails
        }
      }

      // Determine the date to use
      let eventDate;
      if (date) {
        eventDate = moment(date).format('YYYY-MM-DD');
      } else if (selectedTimeRange && selectedTimeRange.start) {
        eventDate = moment(selectedTimeRange.start).format('YYYY-MM-DD');
      } else {
        throw new Error('No valid date selected');
      }

      const eventData = {
        eventName: eventName.trim(),
        description: description.trim(),
        clubId: currentUser.uid,
        clubName: clubName,
        date: eventDate,
        startTime: startTime,
        endTime: endTime,
        location: location.trim(),
        zoomLink: zoomLink.trim(),
        openTo: openTo,
        bannerUrl: bannerUrl,
        createdAt: serverTimestamp(),
        attendees: [],
      };

      console.log('Creating event with data:', eventData);
      await addDoc(collection(db, 'events'), eventData);
      navigate('/club-dashboard');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle calendar slot selection (click and drag)
  const handleSelectSlot = ({ start, end, slots }) => {
    if (slots && slots.length > 0) {
      // Multiple slots selected (drag)
      const startSlot = slots[0];
      const endSlot = slots[slots.length - 1];
      
      setSelectedTimeRange({
        start: startSlot,
        end: endSlot
      });
      
      // Auto-populate form fields
      setDate(startSlot);
      setStartTime(moment(startSlot).format('HH:mm'));
      setEndTime(moment(endSlot).format('HH:mm'));
      
      // Clear individual date/time selections
      setSelectedCalendarDate(null);
      setSelectedHour(null);
    } else {
      // Single slot selected (click)
      setSelectedCalendarDate(start);
      setDate(start);
      setStartTime(moment(start).format('HH:mm'));
      setEndTime(moment(start).add(1, 'hour').format('HH:mm'));
      
      // Clear time range selection
      setSelectedTimeRange(null);
    }
  };

  // Handle calendar event selection
  const handleSelectEvent = (event) => {
    setSelectedCalendarDate(event.start);
    setDate(event.start);
    setStartTime(moment(event.start).format('HH:mm'));
    setEndTime(moment(event.end).format('HH:mm'));
    
    // Clear time range selection
    setSelectedTimeRange(null);
  };

  // Fetch club events for conflict checking
  React.useEffect(() => {
    const fetchClubEvents = async () => {
      if (currentUser) {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const events = eventsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(event => event.clubId === currentUser.uid)
          .map(event => ({
            ...event,
            start: new Date(`${event.date}T${event.startTime}`),
            end: new Date(`${event.date}T${event.endTime}`),
            title: event.eventName
          }));
        setClubEvents(events);
      }
    };
    fetchClubEvents();
  }, [currentUser]);

  if (clubNameLoading) {
    return (
      <>
        <ClubNavigation />
        <div className="min-vh-100 d-flex align-items-center justify-content-center" 
             style={{ background: '#f7f7fa' }}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2 className="text-primary mt-3">Loading club info…</h2>
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <ClubNavigation />
        <div className="min-vh-100 d-flex align-items-center justify-content-center" 
             style={{ background: '#f7f7fa' }}>
          <EventPreview
            eventData={{ 
              eventName, 
              description, 
              clubName, 
              openTo, 
              date: date ? moment(date).format('YYYY-MM-DD') : (selectedTimeRange ? moment(selectedTimeRange.start).format('YYYY-MM-DD') : null), 
              startTime, 
              endTime, 
              location, 
              zoomLink, 
              bgColor 
            }}
            bannerPreview={bannerPreview}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <ClubNavigation />
      <Container fluid className="py-4" style={{ marginTop: '80px' }}>
        <Row>
          {/* Form on the left */}
          <Col lg={6}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 fw-bold">Create New Club Event</h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleFormNext}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Event Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={eventName}
                      onChange={e => {
                        const words = e.target.value.trim().split(/\s+/);
                        if (e.target.value.trim() === '' || words.length <= maxTitleWords) {
                          setEventName(e.target.value);
                        } else {
                          setEventName(words.slice(0, maxTitleWords).join(' '));
                        }
                      }}
                      placeholder="Event Title"
                      size="lg"
                    />
                    <Form.Text className="text-muted">
                      {eventName.trim() === '' ? 0 : eventName.trim().split(/\s+/).length} / {maxTitleWords} words
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Event Banner</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => { setBanner(e.target.files[0]); setBannerPreview(null); }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Event Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder="Event Description"
                    />
                    <Form.Text className="text-muted">
                      {wordCount} / {maxWords} words
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Who can attend?</Form.Label>
                    <Form.Select
                      value={openTo}
                      onChange={(e) => setOpenTo(e.target.value)}
                    >
                      <option value="everyone">Everyone</option>
                      <option value="members">Club Members Only</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Event Date & Time</Form.Label>
                    {(selectedCalendarDate || selectedTimeRange) && (
                      <Alert variant="info" className="mb-3">
                        {selectedTimeRange && selectedTimeRange.start && selectedTimeRange.end ? (
                          <>
                            <strong>Selected Time Range:</strong><br />
                            Date: {moment(selectedTimeRange.start).format('MM/DD/YYYY')}<br />
                            Time: {moment(selectedTimeRange.start).format('h:mm A')} - {moment(selectedTimeRange.end).format('h:mm A')}
                          </>
                        ) : selectedCalendarDate ? (
                          <>
                            <strong>Selected Date:</strong> {moment(selectedCalendarDate).format('MM/DD/YYYY')}<br />
                            <strong>Time:</strong> {startTime} - {endTime}
                          </>
                        ) : null}
                      </Alert>
                    )}
                    <Form.Text className="text-muted">
                      💡 Tip: Click and drag on the calendar to select a time range, or click once for a 1-hour slot
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location (e.g., Online, Quarry Plaza)"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Zoom Link (optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      placeholder="Zoom Link (optional)"
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
                    className="w-100"
                    disabled={loading || !clubName}
                  >
                    Next
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Calendar on the right */}
          <Col lg={6}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0 fw-bold">Select Date & Time</h3>
                <small className="text-light">Click and drag to select time range</small>
              </Card.Header>
              <Card.Body className="p-0">
                <Calendar
                  localizer={localizer}
                  events={clubEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 400 }}
                  views={[Views.MONTH, Views.WEEK, Views.DAY]}
                  defaultView={Views.WEEK}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  onSelectEvent={handleSelectEvent}
                  step={30}
                  timeslots={2}
                  min={moment().startOf('day').add(8, 'hours').toDate()}
                  max={moment().startOf('day').add(22, 'hours').toDate()}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Conflict Modal */}
      <Modal show={showConflictModal} onHide={() => setShowConflictModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold">⚠️ Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {conflictEvent && (
            <div className="text-center">
              <p className="fw-bold">
                Event timing conflicts with <strong>{conflictEvent.title}</strong>
              </p>
              <p className="text-muted">
                ({moment(conflictEvent.start).format('h:mm A')} - {moment(conflictEvent.end).format('h:mm A')})
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowConflictModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateEventPage;