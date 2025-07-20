// pages/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import StudentNavigation from "../components/StudentNavigation";
import { getEventsForStudent, auth, db } from '../firebase'; 
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import availableTags from '../data/availableTags';

export default function NotificationsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [userTags, setUserTags] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [user, setUser] = useState(null);

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
            <div key={event.id} /* ... your inline styles ... */ >
              {/* ... all your event card JSX ... */}
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