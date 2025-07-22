import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import EventPreview from './EventPreview';
import ClubNavigation from '../components/ClubNavigation';
import availableTags from '../data/availableTags';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CreateEventPage = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [openTo, setOpenTo] = useState('everyone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = preview
  const [date, setDate] = useState(null); // Change to Date object
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubNameLoading, setClubNameLoading] = useState(true);
  const [clubTags, setClubTags] = useState([]);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [conflictEvent, setConflictEvent] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const maxTitleWords = 10;

  const navigate = useNavigate();

  const currentUser = auth.currentUser;

  React.useEffect(() => {
    const fetchClubNameAndTags = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'clubs', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClubName(docSnap.data().name || '');
          setClubTags(Array.isArray(docSnap.data().tags) ? docSnap.data().tags : []);
        }
      }
      setClubNameLoading(false);
    };
    fetchClubNameAndTags();
  }, []);

  // Generate a pastel color palette for tags
  const pastelColors = [
    '#ffe5e5', // red
    '#e5ffe5', // green
    '#e5f0ff', // blue
    '#fffbe5', // yellow
    '#fff0e5', // orange
    '#f3e5ff', // purple
    '#ffe5f0', // pink
    '#e5fff6', // teal
    '#f5e5ff', // lavender
    '#e5fff0', // mint
    '#f5ffe5', // light lime
    '#e5eaff', // periwinkle
    '#fff5e5', // peach
    '#f0f0f0', // fallback gray
  ];
  // Map each tag to a color
  const tagColorMap = availableTags.reduce((map, tag, idx) => {
    map[tag] = pastelColors[idx % pastelColors.length];
    return map;
  }, {});

  // Get club tags (if any) from currentUser or club profile (for now, fallback to 'Other')
  // You may want to fetch club tags from Firestore if not available in currentUser
  const firstTag = clubTags[0] || availableTags[0];
  const bgColor = tagColorMap[firstTag] || '#fff';

  const maxWords = 50;
  const wordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length;

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);
    if (value.trim() === '' || words.length <= maxWords) {
      setDescription(value);
    } else {
      setDescription(words.slice(0, maxWords).join(' '));
    }
  };

  const handleFormNext = (e) => {
    e.preventDefault();
    setError('');
    if (!eventName || !description || !banner || !date || !startTime || !endTime || !location) {
      setError('Please fill out all fields and upload a banner.');
      return;
    }
    // Time validation
    if (endTime <= startTime) {
      setError('End time must be after start time.');
      return;
    }
    setBannerPreview(URL.createObjectURL(banner));
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  // Cloudinary
  const uploadToCloudinary = async (file) => {
    const url = 'https://api.cloudinary.com/v1_1/dwo1u3dhn/image/upload';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ucsc_club_upload');
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Cloudinary upload failed');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (!currentUser) {
        setError('You must be logged in to create an event.');
        setLoading(false);
        return;
      }
      // Time validation (extra safety)
      if (endTime <= startTime) {
        setError('End time must be after start time.');
        setLoading(false);
        return;
      }
      if (!clubName) {
        setError('Club name not loaded. Please try again in a moment.');
        setLoading(false);
        console.error('Club name is empty');
        return;
      }
      if (!banner) {
        setError('Banner image is missing.');
        setLoading(false);
        console.error('Banner is missing');
        return;
      }
      let bannerUrl = '';
      try {
        bannerUrl = await uploadToCloudinary(banner);
      } catch (err) {
        setError('Failed to upload banner image.');
        setLoading(false);
        console.error('Cloudinary upload error:', err);
        return;
      }
      const eventData = {
        eventName,
        description,
        bannerUrl,
        clubId: currentUser.uid,
        clubName,
        openTo,
        date: date ? date.toLocaleDateString('en-US') : '',
        startTime,
        endTime,
        location,
        ...(zoomLink && { zoomLink }),
        bgColor,
        tags: clubTags,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'events'), eventData);
      navigate('/club-profile');
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error('Event creation error:', err);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  // ClubEventCalendarModal component
  function ClubEventCalendarModal({ open, onClose, clubEvents, onSelectSlot }) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Filter events for the selected day
    const eventsForDay = selectedDate
      ? clubEvents.filter(ev => moment(ev.start).isSame(selectedDate, 'day'))
      : [];

    // Generate hour slots for the day
    const hours = Array.from({ length: 24 }, (_, i) => i);

    if (!open) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.25)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 32, minWidth: 700, maxWidth: 900, position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#003B5C', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
          <h2 style={{ color: '#003B5C', fontWeight: 800, fontSize: 24, marginBottom: 10, textAlign: 'center' }}>Pick a Date</h2>
          <Calendar
            localizer={localizer}
            events={clubEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 350, background: '#fff', borderRadius: 12, marginBottom: 24 }}
            views={[Views.MONTH]}
            onSelectSlot={({ start }) => setSelectedDate(start)}
            selectable
            onSelectEvent={event => setSelectedDate(event.start)}
          />
          {selectedDate && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ color: '#003B5C', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Pick a Time on {moment(selectedDate).format('MMMM D, YYYY')}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hours.map(hour => {
                  const slotStart = moment(selectedDate).hour(hour).minute(0).toDate();
                  const slotEnd = moment(selectedDate).hour(hour + 1).minute(0).toDate();
                  // Check for conflicts
                  const hasConflict = eventsForDay.some(ev =>
                    (slotStart < ev.end && slotEnd > ev.start)
                  );
                  return (
                    <button
                      key={hour}
                      disabled={hasConflict}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: hasConflict ? '#eee' : '#003B5C',
                        color: hasConflict ? '#aaa' : '#FFD700',
                        border: 'none',
                        fontWeight: 700,
                        cursor: hasConflict ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => {
                        setSelectedTime(slotStart);
                        onSelectSlot(selectedDate, slotStart, slotEnd);
                        onClose();
                      }}
                    >
                      {moment(slotStart).format('h:00 A')}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 16 }}>
                {eventsForDay.length > 0 && <b>Existing Events:</b>}
                {eventsForDay.map(ev => (
                  <div key={ev.id} style={{ color: '#003B5C', fontSize: 15, marginTop: 4 }}>
                    {moment(ev.start).format('h:mm A')} - {moment(ev.end).format('h:mm A')}: {ev.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fetch this club's events for the calendar modal
  React.useEffect(() => {
    if (!auth.currentUser) return;
    const fetchClubEvents = async () => {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsList = eventsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(ev => ev.clubName === clubName && ev.date && ev.startTime && ev.endTime)
        .map(ev => {
          const start = new Date(`${ev.date}T${ev.startTime}`);
          const end = new Date(`${ev.date}T${ev.endTime}`);
          return { ...ev, start, end, title: ev.eventName };
        });
      setClubEvents(eventsList);
    };
    fetchClubEvents();
  }, [clubName]);

  // Day view component
  function DayHourView({ date, events, onSelectRange }) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Helper to get time from hour and y offset
    const getTimeFromY = (y, container) => {
      const rect = container.getBoundingClientRect();
      const hourHeight = rect.height / 24;
      const hour = Math.floor((y - rect.top) / hourHeight);
      return Math.max(0, Math.min(23, hour));
    };

    // Render event blocks
    const renderEventBlocks = () => {
      return events.map(ev => {
        const startHour = moment(ev.start).hour() + moment(ev.start).minute() / 60;
        const endHour = moment(ev.end).hour() + moment(ev.end).minute() / 60;
        const top = `${(startHour / 24) * 100}%`;
        const height = `${((endHour - startHour) / 24) * 100}%`;
        return (
          <div
            key={ev.id}
            style={{
              position: 'absolute',
              left: 70,
              right: 8,
              top,
              height,
              background: '#e5f0ff',
              color: '#003B5C',
              borderRadius: 8,
              padding: '4px 10px',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              zIndex: 2,
              border: '1.5px solid #FFD700',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {ev.title} ({moment(ev.start).format('h:mm A')} - {moment(ev.end).format('h:mm A')})
          </div>
        );
      });
    };

    // Render selection block
    const renderSelectionBlock = () => {
      if (dragStart === null || dragEnd === null) return null;
      const start = Math.min(dragStart, dragEnd);
      const end = Math.max(dragStart, dragEnd) + 1;
      const top = `${(start / 24) * 100}%`;
      const height = `${((end - start) / 24) * 100}%`;
      return (
        <div
          style={{
            position: 'absolute',
            left: 70,
            right: 8,
            top,
            height,
            background: 'rgba(0,59,92,0.18)',
            border: '2px solid #003B5C',
            borderRadius: 8,
            zIndex: 1,
          }}
        />
      );
    };

    return (
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: 340, position: 'relative', height: 600, overflow: 'hidden' }}>
        <h3 style={{ color: '#003B5C', fontWeight: 700, fontSize: 18, margin: '16px 0 8px 16px' }}>{moment(date).format('dddd, MMMM D, YYYY')}</h3>
        <div
          style={{ position: 'relative', height: 520, margin: '0 0 16px 0', background: '#f7f7fa', borderRadius: 8 }}
          onMouseDown={e => {
            const container = e.currentTarget;
            const hour = getTimeFromY(e.clientY, container);
            setDragStart(hour);
            setDragEnd(hour);
            setIsDragging(true);
          }}
          onMouseMove={e => {
            if (!isDragging) return;
            const container = e.currentTarget;
            const hour = getTimeFromY(e.clientY, container);
            setDragEnd(hour);
          }}
          onMouseUp={e => {
            if (!isDragging) return;
            setIsDragging(false);
            if (dragStart !== null && dragEnd !== null) {
              const startHour = Math.min(dragStart, dragEnd);
              const endHour = Math.max(dragStart, dragEnd) + 1;
              const slotStart = moment(date).hour(startHour).minute(0).toDate();
              const slotEnd = moment(date).hour(endHour).minute(0).toDate();
              onSelectRange(slotStart, slotEnd);
            }
            setDragStart(null);
            setDragEnd(null);
          }}
          onMouseLeave={() => {
            setIsDragging(false);
            setDragStart(null);
            setDragEnd(null);
          }}
        >
          {/* Hour lines and labels */}
          {hours.map(hour => (
            <div key={hour} style={{
              position: 'absolute',
              top: `${(hour / 24) * 100}%`,
              left: 0,
              width: '100%',
              height: 1,
              borderTop: '1px solid #e0e0e0',
              zIndex: 0,
            }} />
          ))}
          {/* Hour labels */}
          {hours.map(hour => (
            <div key={hour} style={{
              position: 'absolute',
              top: `calc(${(hour / 24) * 100}% - 8px)`,
              left: 8,
              width: 50,
              color: '#003B5C',
              fontWeight: 600,
              fontSize: 14,
              zIndex: 3,
              textAlign: 'right',
            }}>{moment().hour(hour).minute(0).format('h A')}</div>
          ))}
          {/* Event blocks */}
          {renderEventBlocks()}
          {/* Selection block */}
          {renderSelectionBlock()}
        </div>
      </div>
    );
  }

  if (clubNameLoading) {
    return (
      <>
        <ClubNavigation />
        <div style={{ background: '#f7f7fa', minHeight: '100vh', paddingTop: 80 }}>
          <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h2 style={{ color: '#003B5C', marginBottom: 24 }}>Loading club info…</h2>
          </div>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <ClubNavigation />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: '#f7f7fa' }}>
          <EventPreview
            eventData={{ eventName, description, clubName, openTo, date, startTime, endTime, location, zoomLink, bgColor }}
            bannerPreview={bannerPreview}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <ClubNavigation />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', minHeight: '100vh', background: '#f7f7fa', paddingTop: 70 }}>
        {/* Form on the left */}
        <div style={{ flex: 1, maxWidth: 500, margin: '48px 0 0 48px', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 36 }}>
          <h2 style={{ color: '#003B5C', marginBottom: 24, textAlign: 'center' }}>Create New Club Event</h2>
          <form onSubmit={handleFormNext}>
            <div style={{ marginBottom: 18, position: 'relative' }}>
              <label style={{ fontWeight: 700, color: '#003B5C', fontSize: 16, marginBottom: 6, display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>Event Title</label>
              <input
                type="text"
                value={eventName}
                onChange={e => {
                  const words = e.target.value.trim().split(/\s+/);
                  if (e.target.value.trim() === '' || words.length <= maxTitleWords) {
                    setEventName(e.target.value);
                  } else {
                    setEventName(words.slice(0, maxTitleWords).join(' '));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: '1.5px solid #003B5C',
                  fontSize: 18,
                  color: '#003B5C',
                  fontWeight: 600,
                  background: '#fff',
                  fontFamily: 'Inter, Arial, sans-serif',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  '::placeholder': { color: '#888', fontWeight: 400 }
                }}
                placeholder="Event Title"
              />
              <div style={{ color: '#888', fontSize: 13, position: 'absolute', right: 8, bottom: 6, textAlign: 'right' }}>
                {eventName.trim() === '' ? 0 : eventName.trim().split(/\s+/).length} / {maxTitleWords} words
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="file" accept="image/*" onChange={(e) => { setBanner(e.target.files[0]); setBannerPreview(null); }} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18, position: 'relative' }}>
              <label style={{ fontWeight: 700, color: '#003B5C', fontSize: 16, marginBottom: 6, display: 'block', fontFamily: 'Inter, Arial, sans-serif' }}>Event Description</label>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Event Description"
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '12px',
                  borderRadius: 8,
                  border: '1.5px solid #003B5C',
                  fontSize: 16,
                  color: '#003B5C',
                  fontWeight: 500,
                  background: '#fff',
                  fontFamily: 'Inter, Arial, sans-serif',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  '::placeholder': { color: '#888', fontWeight: 400 }
                }}
                maxLength={maxWords * 20}
              />
              <div style={{ color: '#888', fontSize: 13, position: 'absolute', right: 8, bottom: 6, textAlign: 'right' }}>
                {wordCount} / {maxWords} words
              </div>
            </div>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '12px', fontWeight: 500, color: '#003B5C' }}>Who can attend?</label>
              <select value={openTo} onChange={(e) => setOpenTo(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}>
                <option value="everyone">Everyone</option>
                <option value="members">Club Members Only</option>
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 700, color: '#003B5C', fontSize: 16, marginBottom: 6, display: 'block' }}>Event Date & Time</label>
              <div style={{ marginBottom: 8 }}>
                {selectedCalendarDate && selectedHour && (
                  <div style={{ color: '#003B5C', fontWeight: 600 }}>
                    Selected: {moment(selectedCalendarDate).format('MM/DD/YYYY')} {moment(selectedHour).format('h:00 A')} - {moment(selectedHour).add(1, 'hour').format('h:00 A')}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="Start Time" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="End Time" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g., Online, Quarry Plaza)" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="text" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="Zoom Link (optional)" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }} />
            </div>
            <button type="submit" disabled={loading || !clubName} style={{ width: '100%', background: '#003B5C', color: '#E6C200', border: 'none', borderRadius: 8, padding: '14px 0', fontSize: 18, fontWeight: 600, cursor: loading || !clubName ? 'not-allowed' : 'pointer', marginTop: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              Next
            </button>
            {error && <p style={{ color: 'red', marginTop: '14px', textAlign: 'center' }}>{error}</p>}
          </form>
        </div>
        {/* Calendar and day view on the right */}
        <div style={{ flex: 1.2, margin: '48px 48px 0 32px', minWidth: 500 }}>
          <Calendar
            localizer={localizer}
            events={clubEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 400, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            views={[Views.MONTH]}
            onSelectSlot={({ start }) => setSelectedCalendarDate(start)}
            selectable
            onSelectEvent={event => setSelectedCalendarDate(event.start)}
          />
          {selectedCalendarDate && (
            <DayHourView
              date={selectedCalendarDate}
              events={clubEvents.filter(ev => moment(ev.start).isSame(selectedCalendarDate, 'day'))}
              onSelectRange={(slotStart, slotEnd) => {
                // Check for conflicts
                const conflicts = clubEvents.filter(ev =>
                  moment(ev.start).isSame(selectedCalendarDate, 'day') &&
                  slotStart < ev.end && slotEnd > ev.start
                );
                if (conflicts.length > 0) {
                  setConflictEvent(conflicts[0]);
                  setShowConflictModal(true);
                  return;
                }
                setSelectedHour(slotStart);
                setDate(moment(selectedCalendarDate).format('MM/DD/YYYY'));
                setStartTime(moment(slotStart).format('HH:mm'));
                setEndTime(moment(slotEnd).format('HH:mm'));
              }}
            />
          )}
        </div>
      </div>
      {showConflictModal && conflictEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)', zIndex: 4000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 32, minWidth: 340, maxWidth: 420, position: 'relative', fontFamily: 'Inter, Arial, sans-serif' }}>
            <button onClick={() => setShowConflictModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#003B5C', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
            <h2 style={{ color: '#c00', fontWeight: 800, fontSize: 22, marginBottom: 16, textAlign: 'center' }}>⚠️ Warning</h2>
            <div style={{ color: '#003B5C', fontWeight: 600, fontSize: 16, marginBottom: 18, textAlign: 'center' }}>
              Event timing conflicts with <b>{conflictEvent.title}</b><br />
              ({moment(conflictEvent.start).format('h:mm A')} - {moment(conflictEvent.end).format('h:mm A')})
            </div>
            <button
              onClick={() => setShowConflictModal(false)}
              style={{ background: '#003B5C', color: '#FFD700', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEventPage;