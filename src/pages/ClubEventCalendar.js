import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ClubNavigation from '../components/ClubNavigation';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import availableTags from '../data/availableTags';

const localizer = momentLocalizer(moment);

export default function ClubEventCalendar() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [tags, setTags] = useState(availableTags);
  const [filter, setFilter] = useState('all'); // 'all', 'club', 'tag', 'my'
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const currentUser = auth.currentUser;
  const searchRef = useRef();

  // Fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      setClubs(clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClubs();
  }, []);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEvents();
  }, []);

  // Autocomplete club search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredClubs([]);
      setShowDropdown(false);
      return;
    }
    const filtered = clubs.filter(club =>
      club.name && club.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedClubs.includes(club.id)
    );
    setFilteredClubs(filtered);
    setShowDropdown(filtered.length > 0);
  }, [search, clubs, selectedClubs]);

  // Filtering logic
  let filteredEvents = events;
  if (filter === 'my' && currentUser) {
    filteredEvents = events.filter(ev => ev.clubId === currentUser.uid);
  } else if (filter === 'tag' && selectedTags.length > 0) {
    filteredEvents = events.filter(ev => Array.isArray(ev.tags) && selectedTags.some(tag => ev.tags.includes(tag)));
  } else if (filter === 'club' && selectedClubs.length > 0) {
    filteredEvents = events.filter(ev => selectedClubs.includes(ev.clubId));
  }

  // Remove club/tag
  const removeClub = (id) => setSelectedClubs(selectedClubs.filter(cid => cid !== id));
  const removeTag = (tag) => setSelectedTags(selectedTags.filter(t => t !== tag));

  // Dropdown close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7f7fa 60%, #e5f0ff 100%)', fontFamily: 'Inter, Arial, sans-serif', paddingTop: 70 }}>
      <ClubNavigation />
      <div style={{ display: 'flex', gap: 32, maxWidth: 1400, margin: '0 auto', alignItems: 'flex-start', padding: '40px 24px 0 24px' }}>
        {/* Calendar */}
        <div style={{ flex: 1.5, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, minHeight: 600 }}>
          <h2 style={{ color: '#003B5C', fontWeight: 900, fontSize: 32, marginBottom: 24, letterSpacing: 0.5 }}>Club Events Calendar</h2>
          <Calendar
            localizer={localizer}
            events={filteredEvents.map(ev => ({
              ...ev,
              title: ev.eventName,
              start: new Date(`${ev.date}T${ev.startTime}`),
              end: new Date(`${ev.date}T${ev.endTime}`),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 24 }}
            eventPropGetter={() => ({ style: { backgroundColor: '#e5f0ff', color: '#003B5C', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: 15 } })}
            popup
            views={['month', 'week', 'day', 'agenda']}
            components={{ event: (props) => <span>{props.title}</span> }}
          />
        </div>
        {/* Sidebar */}
        <div style={{ flex: 0.7, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, minWidth: 320 }}>
          <h3 style={{ color: '#003B5C', fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Filters</h3>
          {/* All Events */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#003B5C', fontSize: 16 }}>
              <input type="radio" checked={filter === 'all'} onChange={() => setFilter('all')} /> All Events
            </label>
          </div>
          {/* By Club */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#003B5C', fontSize: 16 }}>
              <input type="radio" checked={filter === 'club'} onChange={() => setFilter('club')} /> By Club
            </label>
            {filter === 'club' && (
              <div ref={searchRef} style={{ position: 'relative', marginTop: 8 }}>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search clubs..."
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #003B5C', fontSize: 16, color: '#003B5C', fontWeight: 500, background: '#fff', marginBottom: 0 }}
                  onFocus={() => setShowDropdown(filteredClubs.length > 0)}
                  autoComplete="off"
                />
                {showDropdown && (
                  <div style={{ background: '#fff', border: '1.5px solid #003B5C', borderRadius: 8, marginTop: 2, maxHeight: 180, overflowY: 'auto', position: 'absolute', zIndex: 2000, width: '100%' }}>
                    {filteredClubs.map(club => (
                      <div
                        key={club.id}
                        style={{ padding: '8px 14px', cursor: 'pointer', color: '#003B5C', fontWeight: 600, fontSize: 15, borderBottom: '1px solid #f0f0f0' }}
                        onClick={() => { setSelectedClubs([club.id]); setSearch(''); setShowDropdown(false); }}
                      >
                        {club.name}
                      </div>
                    ))}
                  </div>
                )}
                {/* Selected club as tag */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {selectedClubs.map(cid => {
                    const club = clubs.find(c => c.id === cid);
                    if (!club) return null;
                    return (
                      <span key={cid} style={{ background: '#e5f0ff', color: '#003B5C', borderRadius: 12, padding: '4px 12px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FFD700'}
                        onMouseLeave={e => e.currentTarget.style.background = '#e5f0ff'}
                      >
                        {club.name}
                        <span onClick={() => setSelectedClubs([])} style={{ marginLeft: 8, color: '#c00', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>×</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* By Tag */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#003B5C', fontSize: 16 }}>
              <input type="radio" checked={filter === 'tag'} onChange={() => setFilter('tag')} /> By Tag
            </label>
            {filter === 'tag' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ position: 'relative' }}>
                  <select
                    multiple
                    value={selectedTags}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedTags(options);
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #003B5C', fontSize: 16, color: '#003B5C', fontWeight: 500, background: '#fff', marginBottom: 0, minHeight: 80 }}
                  >
                    {tags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
                {/* Selected tags as tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {selectedTags.map(tag => (
                    <span key={tag} style={{ background: '#e5f0ff', color: '#003B5C', borderRadius: 12, padding: '4px 12px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFD700'}
                      onMouseLeave={e => e.currentTarget.style.background = '#e5f0ff'}
                    >
                      {tag}
                      <span onClick={() => removeTag(tag)} style={{ marginLeft: 8, color: '#c00', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>×</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* My Events */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#003B5C', fontSize: 16 }}>
              <input type="radio" checked={filter === 'my'} onChange={() => setFilter('my')} /> My Events
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 