export const dynamic = 'force-dynamic';

// Simulate a notification source
const getNotifications = async () => {
  // Simulate a delay (representing a real-time API call)
  await new Promise((resolve) => setTimeout(resolve, 500));
 
  // Return notifications with a timestamp showing they are fresh
  return [
    {
      id: 1,
      message: 'New message from Alice',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      message: 'System alert: High CPU usage',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 3,
      message: 'Order #12345 shipped',
      timestamp: new Date().toLocaleTimeString(),
    },
  ];
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Notifications (Real-Time)</h1>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Page rendered at: {new Date().toLocaleTimeString()}
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notifications.map((notif) => (
          <li
            key={notif.id}
            style={{
              padding: '1rem',
              backgroundColor: '#f0f0f0',
              marginBottom: '0.5rem',
              borderRadius: '4px',
              borderLeft: '4px solid #3b82f6',
            }}
          >
            <p style={{ margin: 0 }}>{notif.message}</p>
            <small style={{ color: '#666' }}>Fetched: {notif.timestamp}</small>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem' }}>
        Refresh the page - timestamps should update, proving it is rendering fresh each time.
      </p>
    </main>
  );
}