// Utility to check if an event is archived (more than 48 hours since end time)
export function isEventArchived(event) {
  if (!event || !event.end) return false;
  const endTime = new Date(event.end);
  const now = new Date();
  const diffMs = now - endTime;
  const hours = diffMs / (1000 * 60 * 60);
  return hours > 48;
} 