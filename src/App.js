import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StudentLogin from './pages/StudentLogin.js';
import MainLogin from './pages/MainLogin.js';
import BrowseClubs from './pages/BrowseClubs.js';
import CalendarPage from './pages/CalendarPage.js';
import NotificationsPage from './pages/NotificationsPage.js';
import ClubSignUp from './pages/ClubSignUp.js';

const HomePage = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Club Connect</h1>
      <Link to="/student-login">
        <button>Login as Student</button>
      </Link>
      <Link to="/main-login" style={{ marginLeft: '10px' }}>
        <button>Login as Club</button>
      </Link>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/main-login" element={<MainLogin />} />
        <Route path="/browse-clubs" element={<BrowseClubs />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/club-signup" element={<ClubSignUp />} /> 
      </Routes>
    </div>
  );
}

export default App;