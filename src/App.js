// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLogin from "./pages/MainLogin";
import StudentLogin from "./pages/StudentLogin";
import CalendarPage from "./pages/CalendarPage";
import NotificationsPage from "./pages/NotificationsPage";
import BrowseClubs from "./pages/BrowseClubs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/clubs" element={<BrowseClubs />} />
      </Routes>
    </Router>
  );
}

export default App;
