// pages/NotificationsPage.js
import React, { useState, useEffect } from 'react'; // ⬇️ ADDED useState and useEffect
import StudentNavigation from "../components/StudentNavigation";
import { getEvents } from '../firebase'; // ⬇️ ADDED import for our getEvents function

export default function NotificationsPage() {
  // ⬇️ ADDED state to hold events, loading status, and errors
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const renderEvents = () => {
    if (loading) {
      return <p>Loading notifications...</p>;
    }

    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (events.length === 0) {
      return <p>No new event notifications found.</p>;
    }

    return (
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold">{event.eventName}</h3>
            <p className="text-md text-gray-700 font-semibold">Hosted by: {event.clubName}</p>
            <p className="mt-2">{event.description}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>When:</strong> {new Date(event.date).toLocaleDateString()} at {event.time}</p>
              <p><strong>Where:</strong> {event.location}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <StudentNavigation />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        {/* ⬇️ ADDED the function to render events */}
        {renderEvents()}
      </div>
    </div>
  );
}