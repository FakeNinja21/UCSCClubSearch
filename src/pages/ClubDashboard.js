import React, { useEffect, useState } from 'react';
import ClubNavigation from '../components/ClubNavigation';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function ClubDashboard() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [attendeesInfo, setAttendeesInfo] = useState({});
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      setLoadingEvents(true);
      try {
        const q = query(collection(db, 'events'), where('clubId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventList);
        const attendeesData = {};
        for (const event of eventList) {
          if (Array.isArray(event.attendees) && event.attendees.length > 0) {
            const users = await Promise.all(event.attendees.map(async (uid) => {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                return { email: data.email, major: data.major || 'N/A' };
              } else {
                return { email: 'Unknown', major: 'N/A' };
              }
            }));
            attendeesData[event.id] = users;
          } else {
            attendeesData[event.id] = [];
          }
        }
        setAttendeesInfo(attendeesData);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
      setLoadingEvents(false);
    };
    fetchEvents();
  }, [currentUser]);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!currentUser) return;
      setLoadingFollowers(true);
      try {
        const clubDocRef = doc(db, 'clubs', currentUser.uid);
        const clubDocSnap = await getDoc(clubDocRef);
        if (clubDocSnap.exists()) {
          const data = clubDocSnap.data();
          const followerIds = Array.isArray(data.followers) ? data.followers : [];
          const followerData = await Promise.all(followerIds.map(async (uid) => {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              const user = userDoc.data();
              return { email: user.email, major: user.major || 'N/A' };
            } else {
              return { email: 'Unknown', major: 'N/A' };
            }
          }));
          setFollowers(followerData);
        } else {
          setFollowers([]);
        }
      } catch (err) {
        console.error('Error fetching followers:', err);
        setFollowers([]);
      }
      setLoadingFollowers(false);
    };
    fetchFollowers();
  }, [currentUser]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)',
      fontFamily: 'Inter, Arial, sans-serif',
      paddingTop: 70
    }}>
      <ClubNavigation />
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        padding: '3rem 2rem',
        maxWidth: 1300,
        margin: '0 auto',
        alignItems: 'flex-start',
      }}>
        {/* Event Dashboard (Left) */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 18,
          padding: '2rem 1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          minHeight: 400,
        }}>
          <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 28, marginBottom: 18, letterSpacing: 0.5, borderBottom: '2px solid #FFD700', paddingBottom: 8 }}>Event Dashboard</h2>
          <div style={{ marginTop: 24 }}>
            {loadingEvents ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p>No events found.</p>
            ) : (
              events.map(event => (
                <div key={event.id} style={{
                  marginBottom: 32,
                  padding: 20,
                  background: '#f8f9fa',
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  borderLeft: '6px solid #003B5C',
                }}>
                  <h3 style={{ marginBottom: 8, color: '#003B5C', fontWeight: 800, fontSize: 22 }}>{event.eventName || 'Untitled Event'}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                    <span style={{ background: '#FFD700', color: '#003B5C', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 15 }}>Signups: {Array.isArray(event.attendees) ? event.attendees.length : 0}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Attendees:</strong>
                    {attendeesInfo[event.id] && attendeesInfo[event.id].length > 0 ? (
                      <ul style={{ marginTop: 4, marginLeft: 0, paddingLeft: 18 }}>
                        {attendeesInfo[event.id].map((user, idx) => (
                          <li key={idx} style={{ marginBottom: 2 }}>{user.email} <span style={{ color: '#888', fontSize: 14 }}>(Major: {user.major})</span></li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ margin: 0, color: '#888' }}>No attendees yet.</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Generic Dashboard (Right) */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 18,
          padding: '2rem 1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          minHeight: 400,
        }}>
          <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 28, marginBottom: 18, letterSpacing: 0.5, borderBottom: '2px solid #FFD700', paddingBottom: 8 }}>Generic Dashboard</h2>
          <div style={{ marginTop: 24 }}>
            {loadingFollowers ? (
              <p>Loading followers...</p>
            ) : followers.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              <ul style={{ marginLeft: 0, paddingLeft: 18 }}>
                {followers.map((follower, idx) => (
                  <li key={idx} style={{ marginBottom: 2 }}>{follower.email} <span style={{ color: '#888', fontSize: 14 }}>(Major: {follower.major})</span></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 