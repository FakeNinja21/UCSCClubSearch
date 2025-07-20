// pages/NotificationsPage.js
import React, { useState, useEffect } from 'react'; // ⬇️ ADDED useState and useEffect
import StudentNavigation from "../components/StudentNavigation";
import { getEvents } from '../firebase'; // ⬇️ ADDED import for our getEvents function
import availableTags from '../data/availableTags';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function NotificationsPage() {
  // ⬇️ ADDED state to hold events, loading status, and errors
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [userTags, setUserTags] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [user, setUser] = useState(null);

  // Listen for authentication state changes
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

  // Fetch user tags and all clubs
  const fetchUserTagsAndClubs = async (currentUser) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserTags(Array.isArray(data.tags) ? data.tags.filter(tag => availableTags.includes(tag)) : []);
      }
      // Fetch all clubs and their tags
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching user tags and clubs:', error);
    }
  };

  // ⬇️ ADDED useEffect to fetch data when the component loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventList = await getEvents();
        setEvents(eventList);
      } catch (err) {
        console.error("Error fetching events: ", err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // The empty [] means this runs only once

  // Add this function to handle event sign up
  const handleSignUp = async (eventId) => {
    if (!user) return;
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        attendees: arrayUnion(user.uid)
      });
      // Update local state to reflect the change
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

  // Add this function to handle removing event sign up
  const handleRemoveSignup = async (eventId) => {
    if (!user) return;
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        attendees: arrayRemove(user.uid)
      });
      // Update local state to reflect the change
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

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(event => {
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

  const renderEvents = () => {
    if (loading) {
      return <p>Loading notifications...</p>;
    }
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
    if (filteredEvents.length === 0) {
      return <p>No event notifications found for this filter.</p>;
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 48,
        justifyItems: 'center',
        alignItems: 'start',
        maxWidth: 1200,
        margin: '0 auto',
        paddingBottom: 40,
      }}>
        {filteredEvents.map(event => {
          const alreadySignedUp = Array.isArray(event.attendees) && user && event.attendees.includes(user.uid);
          return (
            <div
              key={event.id}
              style={{
                background: event.bgColor || '#fff',
                border: '1.5px solid #e0e0e0',
                borderRadius: 24,
                boxShadow: '0 6px 32px rgba(0,0,0,0.10)',
                padding: 36,
                width: 370,
                minHeight: 480,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, Arial, sans-serif',
                marginBottom: 0,
                transition: 'box-shadow 0.2s, transform 0.2s',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.16)';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 6px 32px rgba(0,0,0,0.10)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <h3 style={{ fontSize: 26, fontWeight: 900, color: '#003B5C', marginBottom: 14, textAlign: 'center', letterSpacing: 0.5 }}>{event.eventName}</h3>
              {event.bannerUrl && (
                <img src={event.bannerUrl} alt="Event Banner" style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 14, marginBottom: 18, border: '2px solid #FFD700', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
              )}
              {Array.isArray(event.tags) && event.tags.length > 0 && (
                <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {event.tags.map((tag, idx) => (
                    <span key={idx} style={{ background: '#e5f0ff', color: '#003B5C', borderRadius: 14, padding: '5px 14px', fontSize: 14, fontWeight: 700, letterSpacing: 0.2 }}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ color: '#003B5C', fontWeight: 700, marginBottom: 8 }}>Hosted by: <span style={{ fontWeight: 400 }}>{event.clubName}</span></div>
              <div style={{ marginBottom: 12, color: '#222', fontWeight: 500 }}><span style={{ color: '#003B5C', fontWeight: 700 }}>Description:</span> {event.description}</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#003B5C', fontWeight: 700 }}>Date:</span> {event.date}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#003B5C', fontWeight: 700 }}>Start Time:</span> {event.startTime}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#003B5C', fontWeight: 700 }}>End Time:</span> {event.endTime}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#003B5C', fontWeight: 700 }}>Location:</span> {event.location}
              </div>
              {event.zoomLink && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#003B5C', fontWeight: 700 }}>Zoom Link:</span> <a href={event.zoomLink} target="_blank" rel="noopener noreferrer" style={{ color: '#003B5C', textDecoration: 'underline', wordBreak: 'break-all' }}>{event.zoomLink}</a>
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#003B5C', fontWeight: 700 }}>Who can attend:</span> {event.openTo === 'everyone' ? 'Everyone' : 'Club Members Only'}
              </div>
              {/* Sign Up/Remove Signup Button */}
              {alreadySignedUp ? (
                <button
                  onClick={() => handleRemoveSignup(event.id)}
                  style={{
                    marginTop: 18,
                    background: '#fffbe5',
                    color: '#c00',
                    border: '1.5px solid #c00',
                    borderRadius: 10,
                    padding: '14px 0',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'background 0.2s, color 0.2s',
                    width: '100%'
                  }}
                >
                  Remove Signup
                </button>
              ) : (
                <button
                  onClick={() => handleSignUp(event.id)}
                  style={{
                    marginTop: 18,
                    background: '#003B5C',
                    color: '#FFD700',
                    border: 'none',
                    borderRadius: 10,
                    padding: '14px 0',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'background 0.2s, color 0.2s',
                    width: '100%'
                  }}
                >
                  Sign Up
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)',
      minHeight: '100vh',
      fontFamily: 'Inter, Arial, sans-serif',
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <StudentNavigation />
      </div>
      <div style={{ paddingTop: 80, paddingLeft: 16, paddingRight: 16, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 24, gap: 0 }}>
          <span style={{ color: '#003B5C', fontWeight: 500, fontSize: 20, opacity: 0.7, marginBottom: 8, marginLeft: 2 }}>Notifications</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ minWidth: 180 }}>
              <label htmlFor="event-filter" style={{ color: '#003B5C', fontWeight: 700, marginRight: 8, fontSize: 18 }}>Filter:</label>
              <select
                id="event-filter"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #003B5C', fontSize: 16, background: '#fff', color: '#003B5C', fontWeight: 600, outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <option value="all">All events</option>
                <option value="bytag">By tag</option>
              </select>
            </div>
          </div>
        </div>
        {renderEvents()}
      </div>
    </div>
  );
}