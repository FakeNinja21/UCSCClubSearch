import React, { useEffect, useState } from 'react';
import StudentNavigation from '../components/StudentNavigation';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import availableTags from '../data/availableTags';

function BrowseClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [carouselIdx, setCarouselIdx] = useState({});
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [user, setUser] = useState(null);

  // Pastel color palette for tags
  const pastelColors = [
    '#ffe5e5', '#e5ffe5', '#e5f0ff', '#fffbe5', '#fff0e5', '#f3e5ff', '#ffe5f0', '#e5fff6', '#f5e5ff', '#e5fff0', '#f5ffe5', '#e5eaff', '#fff5e5', '#f0f0f0',
  ];
  const tagColorMap = availableTags.reduce((map, tag, idx) => {
    map[tag] = pastelColors[idx % pastelColors.length];
    return map;
  }, {});

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchJoinedClubs(user);
      } else {
        setJoinedClubs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchJoinedClubs = async (currentUser) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setJoinedClubs(Array.isArray(data.joinedClubs) ? data.joinedClubs : []);
      }
    } catch (error) {
      console.error('Error fetching joined clubs:', error);
    }
  };

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

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name?.toLowerCase().includes(search.toLowerCase()) ||
      club.description?.toLowerCase().includes(search.toLowerCase());
    const matchesTags = selectedTags.length === 0 || (Array.isArray(club.tags) && club.tags.some(tag => selectedTags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  const handleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const handleCarousel = (id, dir, max) => setCarouselIdx(prev => ({
    ...prev,
    [id]: (prev[id] || 0) + dir < 0 ? max - 1 : ((prev[id] || 0) + dir) % max
  }));
  const handleAddTag = (tag) => {
    if (!selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]);
  };
  const handleRemoveTag = (tag) => setSelectedTags(selectedTags.filter(t => t !== tag));

  const handleJoinClub = async (clubName) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let joined = [];
      if (userSnap.exists()) {
        const data = userSnap.data();
        joined = Array.isArray(data.joinedClubs) ? data.joinedClubs : [];
      }
      if (!joined.includes(clubName)) {
        const updated = [...joined, clubName];
        await updateDoc(userRef, { joinedClubs: updated });
        setJoinedClubs(updated);
        // Also add the student's uid to the club's followers array
        const clubDoc = clubs.find(c => c.name === clubName);
        if (clubDoc) {
          const clubRef = doc(db, 'clubs', clubDoc.id);
          await updateDoc(clubRef, { followers: arrayUnion(user.uid) });
        }
      }
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };

  const handleUnfollowClub = async (clubName) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let joined = [];
      if (userSnap.exists()) {
        const data = userSnap.data();
        joined = Array.isArray(data.joinedClubs) ? data.joinedClubs : [];
      }
      if (joined.includes(clubName)) {
        const updated = joined.filter(name => name !== clubName);
        await updateDoc(userRef, { joinedClubs: updated });
        setJoinedClubs(updated);
        // Also remove the student's uid from the club's followers array
        const clubDoc = clubs.find(c => c.name === clubName);
        if (clubDoc) {
          const clubRef = doc(db, 'clubs', clubDoc.id);
          await updateDoc(clubRef, { followers: arrayRemove(user.uid) });
        }
      }
    } catch (error) {
      console.error('Error unfollowing club:', error);
    }
  };

  return (
    <div style={{ background: '#f7f7fa', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <StudentNavigation />
      </div>
      <div style={{ paddingTop: 80, maxWidth: 1400, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
        <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 36, margin: '32px 0 24px 0', letterSpacing: 0.5 }}>Browse Clubs</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 400, flex: 1 }}>
            <input
              type="text"
              placeholder="Search clubs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid #003B5C', fontSize: 16, background: '#fff', color: '#003B5C', fontWeight: 500, outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            />
          </div>
          <div style={{ minWidth: 220, flex: 1, marginLeft: 16 }}>
            <label htmlFor="tag-filter" style={{ color: '#003B5C', fontWeight: 700, marginRight: 8, fontSize: 16 }}>Filter by tag:</label>
            <select
              id="tag-filter"
              value=""
              onChange={e => { if (e.target.value) handleAddTag(e.target.value); }}
              style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid #003B5C', fontSize: 16, background: '#fff', color: '#003B5C', fontWeight: 600, outline: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginRight: 8 }}
            >
              <option value="">Select tag</option>
              {availableTags.filter(tag => !selectedTags.includes(tag)).map((tag, idx) => (
                <option key={idx} value={tag}>{tag}</option>
              ))}
            </select>
            {selectedTags.map((tag, idx) => (
              <span key={idx} style={{ background: tagColorMap[tag] || '#e5f0ff', color: '#003B5C', borderRadius: 12, padding: '4px 12px', fontSize: 13, fontWeight: 600, marginRight: 6, display: 'inline-flex', alignItems: 'center', marginTop: 4 }}>
                {tag}
                <span onClick={() => handleRemoveTag(tag)} style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 900, color: '#c00', fontSize: 15 }}>&times;</span>
              </span>
            ))}
          </div>
        </div>
        {loading ? (
          <p>Loading clubs...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 56,
            justifyItems: 'center',
            alignItems: 'start',
            maxWidth: 1200,
            margin: '0 auto',
            paddingBottom: 40,
          }}>
            {filteredClubs.map(club => {
              const imgs = Array.isArray(club.imageUrls) ? club.imageUrls : [];
              const idx = carouselIdx[club.id] || 0;
              const firstTag = Array.isArray(club.tags) && club.tags.length > 0 ? club.tags[0] : availableTags[0];
              const bgColor = tagColorMap[firstTag] || '#fff';
              return (
                <div key={club.id} style={{
                  background: bgColor,
                  border: '1.5px solid #e0e0e0',
                  borderRadius: 24,
                  boxShadow: '0 6px 32px rgba(0,0,0,0.10)',
                  padding: 36,
                  width: 370,
                  minHeight: imgs.length > 0 ? 320 : 180,
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'Inter, Arial, sans-serif',
                  marginBottom: 0,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => handleExpand(club.id)}
                >
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: '#003B5C', marginBottom: 14, textAlign: 'center', letterSpacing: 0.5 }}>{club.name}</h3>
                  {imgs.length > 0 && (
                    <div style={{ position: 'relative', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleCarousel(club.id, -1, imgs.length); }}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#fff',
                          border: '1.5px solid #FFD700',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          fontSize: 18,
                          color: '#003B5C',
                          cursor: 'pointer',
                          zIndex: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.95
                        }}
                      >&lt;</button>
                      <img src={imgs[idx]} alt="Club" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 10, border: '2px solid #FFD700', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                      <button
                        onClick={e => { e.stopPropagation(); handleCarousel(club.id, 1, imgs.length); }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#fff',
                          border: '1.5px solid #FFD700',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          fontSize: 18,
                          color: '#003B5C',
                          cursor: 'pointer',
                          zIndex: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.95
                        }}
                      >&gt;</button>
                      {/* Instagram-style dots */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 10 }}>
                        {(() => {
                          const maxDots = 5;
                          const total = imgs.length;
                          let start = 0;
                          let end = total;
                          if (total > maxDots) {
                            if (idx <= 2) {
                              start = 0;
                              end = maxDots;
                            } else if (idx >= total - 3) {
                              start = total - maxDots;
                              end = total;
                            } else {
                              start = idx - 2;
                              end = idx + 3;
                            }
                          }
                          return Array.from({ length: Math.min(total, maxDots) }, (_, i) => {
                            const dotIdx = total > maxDots ? start + i : i;
                            return (
                              <span
                                key={dotIdx}
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: dotIdx === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                                  border: dotIdx === idx ? '2px solid #003B5C' : '1px solid #bbb',
                                  display: 'inline-block',
                                  margin: '0 2px',
                                  boxShadow: dotIdx === idx ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                                  transition: 'background 0.2s, border 0.2s',
                                  cursor: 'pointer'
                                }}
                                onClick={e => { e.stopPropagation(); setCarouselIdx(prev => ({ ...prev, [club.id]: dotIdx })); }}
                              />
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                  {Array.isArray(club.tags) && club.tags.length > 0 && (
                    <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                      {club.tags.map((tag, idx) => (
                        <span key={idx} style={{ background: tagColorMap[tag] || '#e5f0ff', color: '#003B5C', borderRadius: 14, padding: '5px 14px', fontSize: 14, fontWeight: 700, letterSpacing: 0.2 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Expandable Description */}
                  {expanded[club.id] && (
                    <div style={{ marginTop: 18, color: '#003B5C', fontSize: 15, background: '#fffbe5', borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ marginBottom: 8 }}><b>Description:</b> {club.description}</div>
                      {club.email && (
                        <div style={{ marginBottom: 8 }}>
                          <b>Email:</b> <a href={`mailto:${club.email}`} style={{ color: '#003B5C', textDecoration: 'underline' }}>{club.email}</a>
                        </div>
                      )}
                      {club.instagram && (
                        <div style={{ marginBottom: 8 }}>
                          <b>Instagram:</b> <a href={`https://instagram.com/${club.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#003B5C', textDecoration: 'underline' }}>{club.instagram}</a>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Join/Unfollow Club Button */}
                  {joinedClubs.includes(club.name) ? (
                    <button
                      onClick={e => { e.stopPropagation(); handleUnfollowClub(club.name); }}
                      style={{
                        marginTop: 18,
                        width: '100%',
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
                      }}
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); handleJoinClub(club.name); }}
                      style={{
                        marginTop: 18,
                        width: '100%',
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
                      }}
                    >
                      Follow
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseClubs; 