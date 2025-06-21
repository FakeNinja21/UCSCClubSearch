// pages/StudentLogin.js
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/notifications");
  };

  return (
    <div>
      <h1>Student Login</h1>
      <p>This page is a placeholder.</p>
      <button onClick={handleNavigate}>
        Go to Notifications
      </button>
    </div>
  );
}
