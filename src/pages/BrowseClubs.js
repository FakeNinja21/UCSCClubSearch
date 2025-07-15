import React, { useEffect, useState } from 'react';
import StudentNavigation from '../components/StudentNavigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import availableTags from '../data/availableTags';

function BrowseClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [carouselIdx, setCarouselIdx] = useState({});
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Pastel color palette for tags
  const pastelColors = [
    '#ffe5e5', '#e5ffe5', '#e5f0ff', '#fffbe5', '#fff0e5', '#f3e5ff', '#ffe5f0', '#e5fff6', '#f5e5ff', '#e5fff0', '#f5ffe5', '#e5eaff', '#fff5e5', '#f0f0f0',
  ];
  const tagColorMap = availableTags.reduce((map, tag, idx) => {
    map[tag] = pastelColors[idx % pastelColors.length];
    return map;
  }, {});

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
          }}>
            {filteredClubs.map(club => {
              const imgs = Array.isArray(club.imageUrls) ? club.imageUrls : [];
              const idx = carouselIdx[club.id] || 0;
              const firstTag = Array.isArray(club.tags) && club.tags.length > 0 ? club.tags[0] : availableTags[0];
              const bgColor = tagColorMap[firstTag] || '#fff';
              return (
                <div key={club.id} style={{
                  background: bgColor,
                  border: '1px solid #e0e0e0',
                  borderRadius: 20,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                  padding: 32,
                  width: 350,
                  minHeight: 440,
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'Inter, Arial, sans-serif',
                  marginBottom: 0,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: '#003B5C', marginBottom: 10, textAlign: 'center', letterSpacing: 0.5 }}>{club.name}</h3>
                  {imgs.length > 0 && (
                    <div style={{ position: 'relative', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={() => handleCarousel(club.id, -1, imgs.length)} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, color: '#003B5C', cursor: 'pointer', zIndex: 2 }}>&lt;</button>
                      <img src={imgs[idx]} alt="Club" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 10, border: '2px solid #FFD700', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                      <button onClick={() => handleCarousel(club.id, 1, imgs.length)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, color: '#003B5C', cursor: 'pointer', zIndex: 2 }}>&gt;</button>
                    </div>
                  )}
                  {Array.isArray(club.tags) && club.tags.length > 0 && (
                    <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      {club.tags.map((tag, idx) => (
                        <span key={idx} style={{ background: tagColorMap[tag] || '#e5f0ff', color: '#003B5C', borderRadius: 12, padding: '4px 12px', fontSize: 13, fontWeight: 600, letterSpacing: 0.2 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginBottom: 10, color: '#003B5C', fontWeight: 600, textAlign: 'center' }}>
                    {club.description && club.description.length > 80 && !expanded[club.id]
                      ? club.description.slice(0, 80) + '...'
                      : club.description}
                    {club.description && club.description.length > 80 && (
                      <button onClick={() => handleExpand(club.id)} style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 600, marginLeft: 6, cursor: 'pointer', fontSize: 15 }}>
                        {expanded[club.id] ? 'Show less' : '...more'}
                      </button>
                    )}
                  </div>
                  {expanded[club.id] && (
                    <div style={{ marginTop: 10, color: '#003B5C', fontSize: 15 }}>
                      <div><b>Email:</b> {club.email}</div>
                      <div><b>Instagram:</b> {club.instagram}</div>
                    </div>
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