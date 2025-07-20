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
import ProfilePage from './pages/ProfilePage.js';
import ClubProfilePage from "./pages/ClubProfilePage.js";
import CreateEventPage from './pages/CreateEventPage.js';
import YourEventsPage from './pages/YourEventsPage.js';
import HomePage from './pages/HomePage.js';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* DEV DASHBOARD SHORTCUT */}
        <Route path="/" element={<HomePage />} />

        {/* THE ORIGINAL LANDING PAGE */}
        {/* Optionally keep /landing for legacy, or remove if not needed */}

        {/* All other routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignUp />} />
        <Route path="/club-login" element={<ClubLogin />} />
        <Route path="/browse-clubs" element={<BrowseClubs />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/club-signup" element={<ClubSignUp />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/club-profile" element={<ClubProfilePage />} />
        <Route path="/club/:clubId" element={<ClubProfilePage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/your-events" element={<YourEventsPage />} />
      </Routes>
    </div>
  );
}

export default App;