import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
// ⬇️ ADDED: Import the correct dashboard component
import ClubDashboard from './pages/ClubDashboard.js';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Main landing page */}
        <Route path="/" element={<HomePage />} />

        {/* ADDED: Route for the Dev Dashboard */}
        <Route path="/dev-dashboard" element={<DevDashboard />} />

        {/* Student Routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignUp />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Club Routes */}
        <Route path="/club-login" element={<ClubLogin />} />
        <Route path="/club-signup" element={<ClubSignUp />} />
        <Route path="/club-profile" element={<ClubProfilePage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/your-events" element={<YourEventsPage />} />
        {/* ⬇️ FIXED: This route now points to the correct dashboard component */}
        <Route path="/club-dashboard" element={<ClubDashboard />} />


        {/* General Routes */}
        <Route path="/browse-clubs" element={<BrowseClubs />} />
        <Route path="/calendar" element={<CalendarPage />} />
        {/* This route with a parameter should be last to avoid conflicts */}
        <Route path="/club/:clubId" element={<ClubProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
