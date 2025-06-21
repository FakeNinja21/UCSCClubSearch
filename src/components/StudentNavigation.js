// components/StudentNavigation.js
import { Link } from "react-router-dom";

export default function StudentNavigation() {
  return (
    <nav>
      <div style={{ marginBottom: '10px' }}>
        <b style={{ fontSize: '1.2em' }}>Club Connect</b>
      </div>
      <div>
        <Link to="/notifications">Notifications</Link>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <Link to="/clubs">Club Search</Link>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <Link to="/calendar">Calendar</Link>
      </div>
    </nav>
  );
}
