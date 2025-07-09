import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, auth } from '../firebase'; // Import our firebase functions

const CreateEventPage = () => {
  // State to hold the data from our form fields
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  // State for handling errors and loading status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    setError('');
    setLoading(true);

    // Basic validation to ensure no fields are empty
    if (!eventName || !description || !date || !time || !location) {
      setError('Please fill out all fields.');
      setLoading(false);
      return;
    }

    // Get the currently logged-in user (the club)
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('You must be logged in to create an event.');
      setLoading(false);
      return;
    }

    // This is the data object we will send to Firestore
    const eventData = {
      eventName,
      description,
      date,
      time,
      location,
      clubId: currentUser.uid, // Link the event to the club's ID
      clubName: currentUser.displayName || 'A Club', // Use the club's display name
    };

    try {
      await createEvent(eventData);
      // If successful, navigate to the club's profile page, or a dashboard
      navigate('/club-profile'); 
    } catch (err) {
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event Name" style={{ width: '300px', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event Description" style={{ width: '300px', height: '100px', padding: '8px' }}></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g., Online, Quarry Plaza)" style={{ width: '300px', padding: '8px' }}/>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Posting...' : 'Post Event'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default CreateEventPage;