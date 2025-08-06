import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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

import HomePage from './pages/HomePage.js';
// ⬇️ ADDED: Import the correct dashboard component
import ClubDashboard from './pages/ClubDashboard.js';
import ClubEventCalendar from './pages/ClubEventCalendar';
import ProfileCompletionGuard from './components/ProfileCompletionGuard';

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
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Club Routes */}
        <Route path="/club-login" element={<ClubLogin />} />
        <Route path="/club-signup" element={<ClubSignUp />} />
        <Route path="/club-profile" element={<ClubProfilePage />} />

        {/* Protected Routes - Require Profile Completion */}
        <Route path="/notifications" element={
          <ProfileCompletionGuard>
            <NotificationsPage />
          </ProfileCompletionGuard>
        } />
        <Route path="/create-event" element={
          <ProfileCompletionGuard>
            <CreateEventPage />
          </ProfileCompletionGuard>
        } />

        <Route path="/club-dashboard" element={
          <ProfileCompletionGuard>
            <ClubDashboard />
          </ProfileCompletionGuard>
        } />
        <Route path="/club-calendar" element={
          <ProfileCompletionGuard>
            <ClubEventCalendar />
          </ProfileCompletionGuard>
        } />
        <Route path="/browse-clubs" element={
          <ProfileCompletionGuard>
            <BrowseClubs />
          </ProfileCompletionGuard>
        } />
        <Route path="/calendar" element={
          <ProfileCompletionGuard>
            <CalendarPage />
          </ProfileCompletionGuard>
        } />
        {/* This route with a parameter should be last to avoid conflicts */}
        <Route path="/club/:clubId" element={<ClubProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
