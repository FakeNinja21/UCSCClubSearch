// components/StudentNavigation.js
import { useNavigate } from "react-router-dom";

export default function StudentNavigation() {
  const navigate = useNavigate();
  return (
    <nav>
      <div style={{ marginBottom: '10px' }}>
        <b style={{ fontSize: '1.2em' }}>Club Connect</b>
      </div>
      <div>
        <button onClick={() => navigate('/notifications')}>Notifications</button>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <button onClick={() => navigate('/clubs')}>Club Search</button>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <button onClick={() => navigate('/calendar')}>Calendar</button>
      </div>
    </nav>
  );
}
