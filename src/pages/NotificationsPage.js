// pages/NotificationsPage.js
import StudentNavigation from "../components/StudentNavigation";

export default function NotificationsPage() {
  return (
    <div>
      <StudentNavigation />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        <p>This is your home feed! You’ll see club events and announcements here.</p>
      </div>
    </div>
  );
}
