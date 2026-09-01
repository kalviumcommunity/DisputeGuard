import { notFound } from 'next/navigation';

// Mock API functions simulating async operations with artificial delays
async function getUserByEmail(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (email !== 'alex@example.com') return null;
  return { id: 'usr_101', name: 'Alex', email };
}

async function getOrdersForUser(userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: 'ord_1', item: 'Laptop Stand', total: 45.0 },
    { id: 'ord_2', item: 'Mechanical Keyboard', total: 120.0 },
  ];
}

async function getSitePreferences() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { theme: 'dark', currency: 'USD' };
}

export default async function UserOrdersPage() {
  const email = 'alex@example.com';

  // Task 2: Initiate independent fetch early without awaiting immediately
  const preferencesPromise = getSitePreferences().catch(() => ({
    theme: 'light',
    currency: 'USD',
  }));

  // Task 1: Fetch user first (Sequential Step 1)
  const user = await getUserByEmail(email);

  // Task 3: Missing user error handling
  if (!user) {
    notFound();
  }

  // Task 1 & Task 2: Parallelize independent preferences fetch alongside dependent orders fetch
  // Note: getOrdersForUser MUST run sequentially after user fetch because user.id is required.
  let orders = [];
  let preferences = { theme: 'light', currency: 'USD' };

  try {
    const [ordersResult, preferencesResult] = await Promise.all([
      getOrdersForUser(user.id),
      preferencesPromise,
    ]);
    orders = ordersResult;
    preferences = preferencesResult;
  } catch (error) {
    // Task 3: Order fetch failure fallback handling without exposing raw errors
    console.error('Failed to load user orders:', error);
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>User Dashboard</h1>

      <section style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
        <h2>User Info</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Theme Preference:</strong> {preferences.theme}</p>
      </section>

      <section>
        <h2>Order History</h2>
        {orders.length === 0 ? (
          <p>Unable to load orders at this time.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {orders.map((order) => (
              <li key={order.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                {order.item} — ${order.total}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}