import React, { useEffect, useState } from 'react';
import StudentNavigation from '../components/StudentNavigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function BrowseClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubsSnapshot = await getDocs(collection(db, 'clubs'));
        const clubsList = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClubs(clubsList);
      } catch (err) {
        console.error('Error fetching clubs:', err);
      }
      setLoading(false);
    };
    fetchClubs();
  }, []);

  return (
    <div>
      <h1>Browse Clubs</h1>
      <StudentNavigation />
      <div style={{ margin: '20px 0' }}>
        <input type="text" placeholder="Search clubs..." style={{ width: '100%', padding: '8px', marginBottom: '16px' }} />
      </div>
      {loading ? (
        <p>Loading clubs...</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {clubs.map(club => (
            <button
              key={club.id}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #007bff',
                background: '#f0f8ff',
                color: '#007bff',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              {club.name ? club.name : club.email}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseClubs; 