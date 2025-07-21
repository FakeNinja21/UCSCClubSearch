import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StudentNavigation from '../components/StudentNavigation';
import { getEvents } from '../firebase';

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

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    saveFilterPreference(newFilter);
  };

  // Handle club selection
  const handleClubToggle = (clubName) => {
    const newSelectedClubs = selectedClubs.includes(clubName)
      ? selectedClubs.filter(name => name !== clubName)
      : [...selectedClubs, clubName];
    
    setSelectedClubs(newSelectedClubs);
    saveSelectedClubs(newSelectedClubs);
  };

  // Handle select all/none
  const handleSelectAll = () => {
    const allClubNames = clubs.map(club => club.name);
    setSelectedClubs(allClubNames);
    saveSelectedClubs(allClubNames);
  };

  const handleSelectNone = () => {
    setSelectedClubs([]);
    saveSelectedClubs([]);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventList = await getEvents();
        // Map events to calendar format
        const mapped = eventList.map(event => {
          // Combine date and time fields into JS Date objects
          const start = new Date(`${event.date}T${event.startTime}`);
          const end = new Date(`${event.date}T${event.endTime}`);
          return {
            id: event.id,
            title: event.eventName,
            start,
            end,
            desc: event.description,
            clubName: event.clubName,
            location: event.location,
            tags: event.tags,
            bgColor: event.bgColor,
            bannerUrl: event.bannerUrl,
            openTo: event.openTo,
            zoomLink: event.zoomLink,
            clubId: event.clubId, // Add clubId to the event object
            attendees: event.attendees || [], // <-- Add this line
          };
        });
        setEvents(mapped);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filtering logic
  let filteredEvents = events.filter(event => {
    // Always show if open to everyone
    if (event.openTo === 'everyone') return true;
    // Otherwise, only show if the user has joined the club
    return joinedClubs.includes(event.clubName);
  });
  if (filter === 'followed') {
    filteredEvents = filteredEvents.filter(event => selectedClubs.includes(event.clubName));
  } else if (filter === 'signedup') {
    filteredEvents = filteredEvents.filter(event => Array.isArray(event.attendees) && user && event.attendees.includes(user.uid));
  }

  // Custom event style for color coding
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.bgColor || '#e5f0ff',
        color: '#003B5C',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 600,
        fontSize: 15,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }
    };
  };

  // Modal for event details
  const EventModal = ({ event, onClose }) => (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.25)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: 32,
        minWidth: 340,
        maxWidth: 420,
        position: 'relative',
        fontFamily: 'Inter, Arial, sans-serif',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#003B5C', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
        <h2 style={{ color: '#003B5C', fontWeight: 800, fontSize: 24, marginBottom: 10, textAlign: 'center' }}>{event.title}</h2>
        {event.bannerUrl && (
          <img src={event.bannerUrl} alt="Event Banner" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 16, border: '2px solid #FFD700', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
        )}
        <div style={{ color: '#003B5C', fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Hosted by: <span style={{ fontWeight: 400 }}>{event.clubName}</span></div>
        <div style={{ marginBottom: 10, color: '#003B5C', fontWeight: 500 }}><span style={{ fontWeight: 700 }}>Description:</span> {event.desc}</div>
        <div style={{ marginBottom: 6 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>Date:</span> {event.start.toLocaleDateString()}</div>
        <div style={{ marginBottom: 6 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>Start Time:</span> {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div style={{ marginBottom: 6 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>End Time:</span> {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div style={{ marginBottom: 6 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>Location:</span> {event.location}</div>
        {event.zoomLink && (
          <div style={{ marginBottom: 6 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>Zoom Link:</span> <a href={event.zoomLink} target="_blank" rel="noopener noreferrer" style={{ color: '#003B5C', textDecoration: 'underline', wordBreak: 'break-all' }}>{event.zoomLink}</a></div>
        )}
        <div style={{ marginBottom: 6 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>Who can attend:</span> {event.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}</div>
        {Array.isArray(event.tags) && event.tags.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {event.tags.map((tag, idx) => (
              <span key={idx} style={{ background: '#e5f0ff', color: '#003B5C', borderRadius: 12, padding: '4px 12px', fontSize: 13, fontWeight: 600, letterSpacing: 0.2 }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f7f7fa', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <StudentNavigation />
      </div>
      <div style={{ paddingTop: 80, maxWidth: 1400, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 0 0' }}>
          <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 36, letterSpacing: 0.5 }}>📅 Club Events Calendar</h2>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: '#003B5C',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            {sidebarOpen ? 'Hide' : 'Show'} Club Filters
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 24, flexDirection: 'row-reverse' }}>
          {/* Clubs Filter Sidebar - now on the right */}
          {sidebarOpen && (
            <div style={{
              width: 280,
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              height: 'fit-content',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              position: 'sticky',
              top: 100
            }}>
              <h3 style={{ color: '#003B5C', fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Clubs Joined</h3>
              {/* Filter Options */}
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#003B5C', fontSize: 14, marginBottom: 8 }}>
                  <input type="radio" name="calfilter" checked={filter === 'all'} onChange={() => handleFilterChange('all')} /> All Clubs
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#003B5C', fontSize: 14, marginBottom: 8 }}>
                  <input type="radio" name="calfilter" checked={filter === 'followed'} onChange={() => handleFilterChange('followed')} /> Followed Clubs
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#003B5C', fontSize: 14, marginBottom: 8 }}>
                  <input type="radio" name="calfilter" checked={filter === 'signedup'} onChange={() => handleFilterChange('signedup')} /> Signed Up Events
                </label>
              </div>

              {/* Select All/None buttons and club checkboxes only for Selected Clubs */}
              {filter === 'followed' && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <button 
                      onClick={handleSelectAll}
                      style={{
                        background: '#e5f0ff',
                        color: '#003B5C',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 12
                      }}
                    >
                      Select All
                    </button>
                    <button 
                      onClick={handleSelectNone}
                      style={{
                        background: '#e5f0ff',
                        color: '#003B5C',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 12
                      }}
                    >
                      Select None
                    </button>
                  </div>
                  {/* Club checkboxes - only show joined clubs */}
                  <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {clubs.filter(club => joinedClubs.includes(club.name)).map((club) => (
                      <label key={club.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#003B5C'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedClubs.includes(club.name)}
                          onChange={() => handleClubToggle(club.name)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: '#003B5C'
                          }}
                        />
                        <span style={{ flex: 1 }}>{club.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
              <div style={{ marginTop: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, fontSize: 12, color: '#666' }}>
                <strong>Selected:</strong> {selectedClubs.length} of {clubs.filter(club => joinedClubs.includes(club.name)).length} clubs
              </div>
            </div>
          )}

          {/* Calendar */}
          <div style={{ flex: 1 }}>
            {loading ? <p>Loading events...</p> : (
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 24 }}
                eventPropGetter={eventStyleGetter}
                popup
                views={['month', 'week', 'day']}
                components={{ event: (props) => <span>{props.title}</span>, eventWrapper: ({ event, children }) => <div title={event.desc}>{children}</div> }}
                tooltipAccessor={null}
                onSelectEvent={event => setSelectedEvent(event)}
              />
            )}
          </div>
        </div>
        
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </div>
    </div>
  );
};

export default CalendarPage;
