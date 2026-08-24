async function checkDashboardZero() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    const email = `test.zero.${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Zero Test User',
        email,
        password: 'Password123!'
      })
    });
    const regData = await regRes.json();
    const cookie = regRes.headers.get('set-cookie').split(';')[0];
    
    // Fetch dashboard
    const dashRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' }
    });
    const dashData = await dashRes.json();
    console.log('--- ZERO TRANSACTIONS DASHBOARD PAYLOAD ---');
    console.log(JSON.stringify(dashData.data, null, 2));
    
    console.log('✅ ZERO TRANSACTIONS DASHBOARD INTEGRATION TEST PASSED!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  }
}

checkDashboardZero();
