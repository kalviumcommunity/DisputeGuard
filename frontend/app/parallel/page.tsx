async function getProfile() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { name: 'Ava' };
}

async function getNotifications() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return ['Build passed', 'New comment'];
}

async function getAnalytics() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { visits: 1280 };
}

async function getSequentialData() {
  const started = Date.now();

  const profile = await getProfile();
  const notifications = await getNotifications();
  const analytics = await getAnalytics();

  return {
    profile,
    notifications,
    analytics,
    time: Date.now() - started,
  };
}

async function getParallelData() {
  const started = Date.now();

  const [profile, notifications, analytics] = await Promise.all([
    getProfile(),
    getNotifications(),
    getAnalytics(),
  ]);

  return {
    profile,
    notifications,
    analytics,
    time: Date.now() - started,
  };
}

export default async function ParallelPage() {
  try {
    const sequential = await getSequentialData();
    const parallel = await getParallelData();

    console.log('Sequential ms:', sequential.time);
    console.log('Parallel ms:', parallel.time);

    return (
      <main>
        <h1>Parallel Data Fetching</h1>

        <h2>Profile</h2>
        <p>Name: {parallel.profile.name}</p>

        <h2>Notifications</h2>
        <ul>
          {parallel.notifications.map((notification) => (
            <li key={notification}>{notification}</li>
          ))}
        </ul>

        <h2>Analytics</h2>
        <p>Visits: {parallel.analytics.visits}</p>

        <h2>Performance</h2>
        <p>Sequential: {sequential.time} ms</p>
        <p>Parallel: {parallel.time} ms</p>
      </main>
    );
  } catch (error) {
    console.error('Data fetching failed:', error);

    return <p>Failed to load dashboard data.</p>;
  }
}