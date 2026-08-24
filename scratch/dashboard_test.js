async function checkDashboard() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    // Register
    const email = `test.dashboard.${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dashboard Test User',
        email,
        password: 'Password123!'
      })
    });
    const regData = await regRes.json();
    const cookie = regRes.headers.get('set-cookie').split(';')[0];
    
    // Add income
    await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'income',
        amount: 5000,
        category: 'Salary',
        description: 'Salary payment',
        date: new Date().toISOString()
      })
    });

    // Add expense
    await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'expense',
        amount: 1200,
        category: 'Food & Dining',
        description: 'Lunch',
        date: new Date().toISOString()
      })
    });

    // Fetch dashboard
    const dashRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' }
    });
    const dashData = await dashRes.json();
    console.log('--- DASHBOARD PAYLOAD ---');
    console.log(JSON.stringify(dashData.data, null, 2));
    
    if (dashData.data.spendingTrend && dashData.data.spendingTrend['30D']) {
      console.log('✅ spendingTrend with 30D is present!');
    } else {
      throw new Error('spendingTrend not returned correctly');
    }
    
    if (dashData.data.categoryData && dashData.data.categoryData.length > 0) {
      console.log('✅ categoryData has elements!');
    } else {
      throw new Error('categoryData is empty or missing');
    }

    console.log('✅ DASHBOARD INTEGRATION TEST PASSED!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  }
}

checkDashboard();
