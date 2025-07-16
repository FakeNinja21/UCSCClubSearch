import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import StudentNavigation from '../components/StudentNavigation';
import { getEvents } from '../firebase';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'interest', 'joined'
  const [userTags, setUserTags] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    // Fetch user tags, joined clubs, and all clubs with tags
    const fetchUserDataAndClubs = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserTags(Array.isArray(data.tags) ? data.tags : []);
        setJoinedClubs(Array.isArray(data.joinedClubs) ? data.joinedClubs : []);
      }
      // Fetch all clubs and their tags
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUserDataAndClubs();
  }, []);

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
  let filteredEvents = events;
  if (filter === 'interest') {
    filteredEvents = events.filter(event => {
      let club = null;
      if (event.clubId) {
        club = clubs.find(c => c.id === event.clubId);
      }
      if (!club && event.clubName) {
        club = clubs.find(c => c.name === event.clubName);
      }
      const clubTags = Array.isArray(club?.tags) ? club.tags : [];
      const userTagList = Array.isArray(userTags) ? userTags : [];
      return clubTags.some(tag => userTagList.includes(tag));
    });
  } else if (filter === 'joined') {
    filteredEvents = events.filter(event => joinedClubs.includes(event.clubName));
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
        <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 36, margin: '32px 0 24px 0', letterSpacing: 0.5 }}>📅 Club Events Calendar</h2>
        {/* Calendar Filters */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#003B5C', fontSize: 17 }}>
            <input type="radio" name="calfilter" checked={filter === 'all'} onChange={() => setFilter('all')} /> All Clubs
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#003B5C', fontSize: 17 }}>
            <input type="radio" name="calfilter" checked={filter === 'interest'} onChange={() => setFilter('interest')} /> Topics of Interest
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#003B5C', fontSize: 17 }}>
            <input type="radio" name="calfilter" checked={filter === 'joined'} onChange={() => setFilter('joined')} /> Joined Clubs
          </label>
        </div>
        {loading ? <p>Loading events...</p> : (
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 24 }}
            eventPropGetter={eventStyleGetter}
            popup
            views={['month', 'week', 'day', 'agenda']}
            components={{ event: (props) => <span>{props.title}</span>, eventWrapper: ({ event, children }) => <div title={event.desc}>{children}</div> }}
            tooltipAccessor={null}
            onSelectEvent={event => setSelectedEvent(event)}
          />
        )}
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </div>
    </div>
  );
};

export default CalendarPage;
