// pages/MainLogin.js
import { useNavigate } from "react-router-dom";

export default function MainLogin() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-4xl font-bold mb-10 text-blue-700">Club Connect</h1>
      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => navigate("/student-login")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login as Student
        </button>
        <button
          onClick={() => navigate("/club-login")}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Login as Club
        </button>
      </div>
    </div>
  );
}
