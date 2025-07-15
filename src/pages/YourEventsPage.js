import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import ClubNavigation from '../components/ClubNavigation';

const YourEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = auth.currentUser;

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      if (!currentUser) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }
      const q = query(collection(db, 'events'), where('clubId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  return (
    <>
      <ClubNavigation />
      <div style={{ background: '#f7f7fa', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#003B5C', marginBottom: 24, textAlign: 'center' }}>Your Events</h2>
          {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
            events.length === 0 ? <p>No events found.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {events.map(event => (
                  <li key={event.id} style={{ marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
                    <div style={{ fontWeight: 600, color: '#003B5C', fontSize: 18 }}>{event.eventName}</div>
                    <div style={{ color: '#555', marginBottom: 6 }}>Date: {event.date}</div>
                    <button onClick={() => handleDelete(event.id)} style={{ background: '#fff', color: '#c00', border: '2px solid #c00', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default YourEventsPage; 