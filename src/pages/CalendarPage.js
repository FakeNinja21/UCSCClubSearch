import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import StudentNavigation from '../components/StudentNavigation';
import { getEvents } from '../firebase';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const db = getFirestore();
  const [loading, setLoading] = useState(true);

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
          };
        });
        setEvents(mapped);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

  // Custom popup for event details
  const EventPopup = ({ event }) => (
    <div style={{ padding: 12, minWidth: 220 }}>
      <div style={{ fontWeight: 700, color: '#003B5C', fontSize: 18, marginBottom: 6 }}>{event.title}</div>
      <div style={{ color: '#003B5C', fontWeight: 500, marginBottom: 4 }}>Hosted by: {event.clubName}</div>
      <div style={{ marginBottom: 4 }}><b>Description:</b> {event.desc}</div>
      <div style={{ marginBottom: 4 }}><b>Location:</b> {event.location}</div>
      <div style={{ marginBottom: 4 }}><b>Start:</b> {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div style={{ marginBottom: 4 }}><b>End:</b> {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      {event.zoomLink && <div style={{ marginBottom: 4 }}><b>Zoom:</b> <a href={event.zoomLink} target="_blank" rel="noopener noreferrer">Link</a></div>}
      {Array.isArray(event.tags) && event.tags.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {event.tags.map((tag, idx) => (
            <span key={idx} style={{ background: '#e5f0ff', color: '#003B5C', borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: '#f7f7fa', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <StudentNavigation />
      </div>
      <div style={{ paddingTop: 80, maxWidth: 1400, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
        <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 36, margin: '32px 0 24px 0', letterSpacing: 0.5 }}>📅 Club Events Calendar</h2>
        {loading ? <p>Loading events...</p> : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 24 }}
            eventPropGetter={eventStyleGetter}
            popup
            views={['month', 'week', 'day', 'agenda']}
            components={{ event: (props) => <span>{props.title}</span>, eventWrapper: ({ event, children }) => <div title={event.desc}>{children}</div> }}
            tooltipAccessor={null}
            onSelectEvent={event => window.alert(`${event.title}\n${event.desc}\nHosted by: ${event.clubName}\nLocation: ${event.location}`)}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
