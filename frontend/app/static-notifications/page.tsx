// NO force-dynamic - will be cached statically at build/render time
const getNotifications = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
 
  return [
    {
      id: 1,
      message: 'This notification may be stale',
      timestamp: new Date().toLocaleTimeString(),
    },
  ];
};

export default async function StaticNotificationsPage() {
  const notifications = await getNotifications();

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Notifications (Cached)</h1>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Page rendered at: {new Date().toLocaleTimeString()}
      </p>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>{notif.message}</li>
        ))}
      </ul>
      <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem' }}>
        Refresh the page - timestamp will NOT update (it is cached).
      </p>
    </main>
  );
}