import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import StudentLogin from './pages/StudentLogin.js';
import ClubLogin from './pages/ClubLogin.js';
import BrowseClubs from './pages/BrowseClubs.js';
import CalendarPage from './pages/CalendarPage.js';
import NotificationsPage from './pages/NotificationsPage.js';
import ClubSignUp from './pages/ClubSignUp.js';
import DevDashboard from './pages/DevDashboard.js';
import StudentSignUp from './pages/StudentSignUp.js';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Club Connect</h1>
      <button onClick={() => navigate('/student-login')}>Login as Student</button>
      <button style={{ marginLeft: '10px' }} onClick={() => navigate('/club-login')}>Login as Club</button>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* DEV DASHBOARD SHORTCUT */}
        <Route path="/" element={<DevDashboard />} />

        {/* THE ORIGINAL LANDING PAGE */}
        <Route path="/landing" element={<HomePage />} />

        {/* All other routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignUp />} />
        <Route path="/club-login" element={<ClubLogin />} />
        <Route path="/browse-clubs" element={<BrowseClubs />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/club-signup" element={<ClubSignUp />} />
      </Routes>
    </div>
  );
}

export default App;