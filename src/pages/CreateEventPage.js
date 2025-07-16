import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import EventPreview from './EventPreview';
import ClubNavigation from '../components/ClubNavigation';
import availableTags from '../data/availableTags';

const CreateEventPage = () => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [openTo, setOpenTo] = useState('everyone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = preview
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubNameLoading, setClubNameLoading] = useState(true);
  const [clubTags, setClubTags] = useState([]);

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
        date,
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
      <div style={{ background: '#f7f7fa', minHeight: '100vh', paddingTop: 80 }}>
        <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#003B5C', marginBottom: 24, textAlign: 'center' }}>Create New Club Event</h2>
          <form onSubmit={handleFormNext}>
            <div style={{ marginBottom: 18 }}>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event Name" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}/>
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="file" accept="image/*" onChange={(e) => { setBanner(e.target.files[0]); setBannerPreview(null); }} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <textarea value={description} onChange={handleDescriptionChange} placeholder="Event Description" style={{ width: '100%', boxSizing: 'border-box', height: '100px', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16, resize: 'vertical' }} maxLength={500}></textarea>
              <div style={{ textAlign: 'right', color: wordCount > maxWords ? 'red' : '#003B5C', fontSize: 13, marginTop: 4 }}>
                {wordCount}/{maxWords} words
              </div>
            </div>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
              <label style={{ marginRight: '12px', fontWeight: 500, color: '#003B5C' }}>Who can attend?</label>
              <select value={openTo} onChange={(e) => setOpenTo(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}>
                <option value="everyone">Everyone</option>
                <option value="members">Club Members Only</option>
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }} />
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
      </div>
    </>
  );
};

export default CreateEventPage;