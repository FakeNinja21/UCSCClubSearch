import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import StudentNavigation from '../components/StudentNavigation';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.studentVisible) {
          eventList.push({
            title: data.title,
            start: new Date(data.start),
            end: new Date(data.end),
            desc: data.description,
          });
        }
      });

      setEvents(eventList);
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <StudentNavigation />
      <div style={{ padding: '2rem' }}>
        <h2>📅 Club Events Calendar</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
