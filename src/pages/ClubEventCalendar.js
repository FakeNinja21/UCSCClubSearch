import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ClubNavigation from '../components/ClubNavigation';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import availableTags from '../data/availableTags';
import { Container, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';

const localizer = momentLocalizer(moment);

export default function ClubEventCalendar() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [tags, setTags] = useState(availableTags);
  const [filter, setFilter] = useState('all'); // 'all', 'club', 'tag', 'my'
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const currentUser = auth.currentUser;
  const searchRef = useRef();

  // Fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClubs();
  }, []);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEvents();
  }, []);

  // Autocomplete club search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredClubs([]);
      setShowDropdown(false);
      return;
    }
    const filtered = clubs.filter(club =>
      club.name && club.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedClubs.includes(club.id)
    );
    setFilteredClubs(filtered);
    setShowDropdown(filtered.length > 0);
  }, [search, clubs, selectedClubs]);

  // Filtering logic
  let filteredEvents = events;
  if (filter === 'my' && currentUser) {
    filteredEvents = events.filter(ev => ev.clubId === currentUser.uid);
  } else if (filter === 'tag' && selectedTags.length > 0) {
    filteredEvents = events.filter(ev => Array.isArray(ev.tags) && selectedTags.some(tag => ev.tags.includes(tag)));
  } else if (filter === 'club' && selectedClubs.length > 0) {
    filteredEvents = events.filter(ev => selectedClubs.includes(ev.clubId));
  }

  // Remove club/tag
  const removeClub = (id) => setSelectedClubs(selectedClubs.filter(cid => cid !== id));
  const removeTag = (tag) => setSelectedTags(selectedTags.filter(t => t !== tag));

  // Dropdown close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)' }}>
      <ClubNavigation />
      <Container fluid className="py-4" style={{ marginTop: '80px' }}>
        <Row>
          {/* Calendar */}
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 fw-bold">Club Events Calendar</h2>
              </Card.Header>
              <Card.Body className="p-0">
                <Calendar
                  localizer={localizer}
                  events={filteredEvents.map(ev => ({
                    ...ev,
                    title: ev.eventName,
                    start: new Date(`${ev.date}T${ev.startTime}`),
                    end: new Date(`${ev.date}T${ev.endTime}`),
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 700 }}
                  eventPropGetter={() => ({ 
                    style: { 
                      backgroundColor: '#e5f0ff', 
                      color: '#003B5C', 
                      borderRadius: '8px', 
                      border: 'none', 
                      fontWeight: 600, 
                      fontSize: 15 
                    } 
                  })}
                  popup
                  views={['month', 'week', 'day', 'agenda']}
                  components={{ event: (props) => <span>{props.title}</span> }}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0 fw-bold">Filters</h3>
              </Card.Header>
              <Card.Body>
                {/* All Events */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    name="filter"
                    id="filter-all"
                    checked={filter === 'all'}
                    onChange={() => setFilter('all')}
                    label="All Events"
                    className="fw-bold"
                  />
                </Form.Group>

                {/* By Club */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    name="filter"
                    id="filter-club"
                    checked={filter === 'club'}
                    onChange={() => setFilter('club')}
                    label="By Club"
                    className="fw-bold"
                  />
                  {filter === 'club' && (
                    <div ref={searchRef} className="mt-2">
                      <Form.Control
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search clubs..."
                        onFocus={() => setShowDropdown(filteredClubs.length > 0)}
                        autoComplete="off"
                      />
                      {showDropdown && (
                        <div className="position-absolute bg-white border rounded mt-1 w-100" style={{ zIndex: 2000, maxHeight: '180px', overflowY: 'auto' }}>
                          {filteredClubs.map(club => (
                            <div
                              key={club.id}
                              className="p-2 border-bottom cursor-pointer"
                              onClick={() => { setSelectedClubs([club.id]); setSearch(''); setShowDropdown(false); }}
                            >
                              {club.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Selected club as badge */}
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedClubs.map(cid => {
                          const club = clubs.find(c => c.id === cid);
                          if (!club) return null;
                          return (
                            <Badge 
                              key={cid} 
                              bg="primary" 
                              className="d-flex align-items-center"
                            >
                              {club.name}
                              <Button
                                variant="link"
                                className="text-white text-decoration-none p-0 ms-2"
                                onClick={() => setSelectedClubs([])}
                              >
                                ×
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Form.Group>

                {/* By Tag */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    name="filter"
                    id="filter-tag"
                    checked={filter === 'tag'}
                    onChange={() => setFilter('tag')}
                    label="By Tag"
                    className="fw-bold"
                  />
                  {filter === 'tag' && (
                    <div className="mt-2">
                      <Form.Select
                        multiple
                        value={selectedTags}
                        onChange={e => {
                          const options = Array.from(e.target.selectedOptions, option => option.value);
                          setSelectedTags(options);
                        }}
                        style={{ minHeight: '80px' }}
                      >
                        {tags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </Form.Select>
                      {/* Selected tags as badges */}
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedTags.map(tag => (
                          <Badge 
                            key={tag} 
                            bg="primary" 
                            className="d-flex align-items-center"
                          >
                            {tag}
                            <Button
                              variant="link"
                              className="text-white text-decoration-none p-0 ms-2"
                              onClick={() => removeTag(tag)}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Form.Group>

                {/* My Events */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    name="filter"
                    id="filter-my"
                    checked={filter === 'my'}
                    onChange={() => setFilter('my')}
                    label="My Events"
                    className="fw-bold"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
} 