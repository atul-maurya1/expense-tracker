async function runTest() {
  const baseUrl = 'http://localhost:5000/api';
  let cookieHeader = '';

  console.log('--- STARTING INTEGRATION TEST ---');

  try {
    // 1. Register User
    console.log('\n1. Registering user...');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      })
    });
    
    const registerData = await registerRes.json();
    console.log('Register response:', registerData);
    if (!registerData.success) {
      throw new Error(`Register failed: ${registerData.message}`);
    }

    // Extract cookie
    const rawCookies = registerRes.headers.get('set-cookie');
    if (rawCookies) {
      cookieHeader = rawCookies.split(';')[0];
      console.log('Successfully captured JWT Cookie:', cookieHeader);
    } else {
      throw new Error('No set-cookie header found in register response');
    }

    // 2. Get Me
    console.log('\n2. Verifying auth status (GET /auth/me)...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const meData = await meRes.json();
    console.log('Me response:', meData);
    if (!meData.success) {
      throw new Error(`Auth me failed: ${meData.message}`);
    }

    // 3. Add Income Transaction
    console.log('\n3. Creating Income Transaction (+10,000)...');
    const incomeRes = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'income',
        amount: 10000,
        category: 'Salary',
        description: 'Monthly Salary',
        date: new Date().toISOString(),
        notes: 'Main source of income'
      })
    });
    const incomeData = await incomeRes.json();
    console.log('Income created:', incomeData);
    if (!incomeData.success) {
      throw new Error(`Income creation failed: ${incomeData.message}`);
    }

    // 4. Add Expense Transaction
    console.log('\n4. Creating Expense Transaction (-1,500)...');
    const expenseRes = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'expense',
        amount: 1500,
        category: 'Food & Dining',
        description: 'Restaurant Dinner',
        date: new Date().toISOString(),
        notes: 'Dinner with family'
      })
    });
    const expenseData = await expenseRes.json();
    console.log('Expense created:', expenseData);
    if (!expenseData.success) {
      throw new Error(`Expense creation failed: ${expenseData.message}`);
    }
    const expenseId = expenseData.data._id;

    // 5. Create Budget
    console.log('\n5. Creating budget for Food & Dining (2,000)...');
    const budgetRes = await fetch(`${baseUrl}/budgets`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: 'Food & Dining',
        amount: 2000,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      })
    });
    const budgetData = await budgetRes.json();
    console.log('Budget created:', budgetData);
    if (!budgetData.success) {
      throw new Error(`Budget creation failed: ${budgetData.message}`);
    }

    // 6. Verify Dashboard API
    console.log('\n6. Fetching dashboard stats...');
    const dashboardRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const dashboardData = await dashboardRes.json();
    console.log('Dashboard data:', JSON.stringify(dashboardData, null, 2));
    
    const { totalIncome, totalExpenses, totalBalance } = dashboardData.data;
    console.log(`Balance checks:
      Income = ${totalIncome} (Expected: 10000)
      Expenses = ${totalExpenses} (Expected: 1500)
      Balance = ${totalBalance} (Expected: 8500)`);
      
    if (totalIncome !== 10000 || totalExpenses !== 1500 || totalBalance !== 8500) {
      throw new Error('Dashboard calculations do not match expected values');
    }

    // 7. Verify Budget usage
    console.log('\n7. Fetching budget usage...');
    const budgetsRes = await fetch(`${baseUrl}/budgets`, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const budgetsData = await budgetsRes.json();
    console.log('Budgets usage data:', JSON.stringify(budgetsData, null, 2));
    const targetBudget = budgetsData.data[0];
    console.log(`Budget checks for ${targetBudget.category}:
      Limit = ${targetBudget.amount} (Expected: 2000)
      Spent = ${targetBudget.spent} (Expected: 1500)
      Remaining = ${targetBudget.remaining} (Expected: 500)
      Used = ${targetBudget.percentageUsed}% (Expected: 75%)`);
      
    if (targetBudget.spent !== 1500 || targetBudget.percentageUsed !== 75) {
      throw new Error('Budget spent/percentage calculations incorrect');
    }

    // 8. Update Transaction
    console.log('\n8. Updating Expense transaction from 1,500 to 1,800...');
    const updateRes = await fetch(`${baseUrl}/transactions/${expenseId}`, {
      method: 'PATCH',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1800
      })
    });
    const updateData = await updateRes.json();
    console.log('Transaction updated:', updateData);
    if (!updateData.success) {
      throw new Error(`Update failed: ${updateData.message}`);
    }

    // 9. Re-verify Budgets usage (should be 90% now)
    console.log('\n9. Re-fetching budgets after update...');
    const reBudgetsRes = await fetch(`${baseUrl}/budgets`, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const reBudgetsData = await reBudgetsRes.json();
    const updatedBudget = reBudgetsData.data[0];
    console.log(`Updated Budget checks:
      Spent = ${updatedBudget.spent} (Expected: 1800)
      Percentage = ${updatedBudget.percentageUsed}% (Expected: 90%)`);
      
    if (updatedBudget.spent !== 1800 || updatedBudget.percentageUsed !== 90) {
      throw new Error('Recalculation on transaction update failed');
    }

    // 10. Delete Transaction
    console.log('\n10. Deleting expense transaction...');
    const deleteRes = await fetch(`${baseUrl}/transactions/${expenseId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const deleteData = await deleteRes.json();
    console.log('Delete response:', deleteData);
    if (!deleteData.success) {
      throw new Error(`Delete failed: ${deleteData.message}`);
    }

    // 11. Re-verify Dashboard (should have expense = 0, balance = 10000)
    console.log('\n11. Re-fetching dashboard after delete...');
    const finalDashboardRes = await fetch(`${baseUrl}/analytics/dashboard`, {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    const finalDashboardData = await finalDashboardRes.json();
    const fd = finalDashboardData.data;
    console.log(`Final Dashboard checks:
      Income = ${fd.totalIncome} (Expected: 10000)
      Expenses = ${fd.totalExpenses} (Expected: 0)
      Balance = ${fd.totalBalance} (Expected: 10000)`);
      
    if (fd.totalExpenses !== 0 || fd.totalBalance !== 10000) {
      throw new Error('Dashboard calculations after delete are incorrect');
    }

    console.log('\n✅ ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:', error.message);
  }
}

runTest();
