const http = require('http');

const makeRequest = (port, path, method, headers = {}, postData = null) => {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    const options = {
      hostname: 'localhost',
      port,
      path,
      method,
      headers: defaultHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runAllTests() {
  console.log('🚀 --- SAKHI BAZAAR COMPREHENSIVE ENDPOINT AUDIT TEST --- 🚀\n');
  const timestamp = Date.now();
  const customerEmail = `cust_${timestamp}@example.com`;
  const sellerEmail = `sell_${timestamp}@example.com`;
  const adminEmail = `admin_${timestamp}@example.com`;
  const password = 'password123';

  let customerToken = '';
  let sellerToken = '';
  let adminToken = '';
  let productId = '';
  let orderId = '';

  // 1. Verify Market Prices & Trends (Public, port 5000)
  console.log('📋 1. Testing Market Prices (GET /api/market/market-prices)...');
  try {
    const marketPrices = await makeRequest(5000, '/api/market/market-prices', 'GET');
    if (marketPrices.statusCode === 200 && Array.isArray(marketPrices.body)) {
      console.log(`   ✅ SUCCESS: Loaded ${marketPrices.body.length} market prices.`);
    } else {
      console.log(`   ❌ FAILED: Status ${marketPrices.statusCode}, response:`, marketPrices.body);
    }
  } catch (err) {
    console.log('   ❌ FAILED with connection error. Is the server running on port 5000?');
  }

  console.log('\n📋 2. Testing Market Trends (GET /api/market/market-trends)...');
  try {
    const marketTrends = await makeRequest(5000, '/api/market/market-trends', 'GET');
    if (marketTrends.statusCode === 200 && Array.isArray(marketTrends.body)) {
      console.log(`   ✅ SUCCESS: Loaded ${marketTrends.body.length} market trends.`);
    } else {
      console.log(`   ❌ FAILED: Status ${marketTrends.statusCode}, response:`, marketTrends.body);
    }
  } catch (err) {
    console.log('   ❌ FAILED with connection error.');
  }

  // 2. Register & login customer
  console.log('\n📋 3. Registering Customer (POST /api/auth/register)...');
  try {
    const regCust = await makeRequest(5000, '/api/auth/register', 'POST', {}, {
      name: 'Test Customer',
      email: customerEmail,
      password,
      role: 'customer'
    });
    if (regCust.statusCode === 201 && regCust.body.token) {
      customerToken = regCust.body.token;
      console.log('   ✅ SUCCESS: Customer registered.');
    } else {
      console.log('   ❌ FAILED:', regCust.body);
    }
  } catch (err) {
    console.log('   ❌ FAILED with connection error.');
  }

  // 3. Register & login seller
  console.log('\n📋 4. Registering Seller (POST /api/auth/register)...');
  try {
    const regSell = await makeRequest(5000, '/api/auth/register', 'POST', {}, {
      name: 'Test Seller',
      email: sellerEmail,
      password,
      role: 'seller',
      aadhaarNumber: '123456789012'
    });
    if (regSell.statusCode === 201 && regSell.body.token) {
      sellerToken = regSell.body.token;
      console.log('   ✅ SUCCESS: Seller registered.');
    } else {
      console.log('   ❌ FAILED:', regSell.body);
    }
  } catch (err) {
    console.log('   ❌ FAILED with connection error.');
  }

  // 4. Verify Admin Registration is Blocked & Admin Login Works (port 5001)
  console.log('\n📋 5. Verifying Admin Public Registration is Blocked (POST /api/admin/auth/register)...');
  try {
    const regAdmin = await makeRequest(5001, '/api/admin/auth/register', 'POST', {}, {
      name: 'Test Admin',
      username: `admin_${timestamp}`,
      email: adminEmail,
      password,
      phoneNumber: '9876543210',
      aadhaarNumber: '987654321098'
    });
    if (regAdmin.statusCode === 404) {
      console.log('   ✅ SUCCESS: Public admin registration endpoint is blocked/disabled (Status 404).');
    } else {
      console.log('   ❌ FAILED: Endpoint should not be accessible! Status:', regAdmin.statusCode);
    }
  } catch (err) {
    console.log('   ❌ Connection error testing admin registration.');
  }

  console.log('\n📋 5b. Verifying Main Auth Register Rejects role=\'admin\' (POST /api/auth/register)...');
  try {
    const regAdminMain = await makeRequest(5000, '/api/auth/register', 'POST', {}, {
      name: 'Fake Admin',
      email: `fake_admin_${timestamp}@example.com`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      role: 'admin',
      phoneNumber: '9876543210'
    });
    if (regAdminMain.statusCode === 400) {
      console.log('   ✅ SUCCESS: Main registration rejected role=\'admin\' with status 400.');
    } else {
      console.log('   ❌ FAILED: Main registration should have rejected role=\'admin\', got:', regAdminMain.statusCode);
    }
  } catch (err) {
    console.log('   ❌ Connection error testing main registration role rejection.');
  }

  console.log('\n📋 5c. Logging in Existing Admin (POST /api/admin/auth/login)...');
  try {
    const loginAdminRes = await makeRequest(5001, '/api/admin/auth/login', 'POST', {}, {
      emailOrUsername: 'admin@sakhibazaar.com',
      password: 'Admin@Password123'
    });
    if (loginAdminRes.statusCode === 200 && loginAdminRes.body.token) {
      adminToken = loginAdminRes.body.token;
      console.log('   ✅ SUCCESS: Existing Admin logged in successfully on port 5001.');
    } else {
      console.log('   ℹ️ Note: Could not login default admin (possibly password changed or DB not running):', loginAdminRes.body);
    }
  } catch (err) {
    console.log('   ❌ Connection error logging in admin.');
  }

  // 5. Test get products & search
  console.log('\n📋 6. Testing Product Search Suggestion (GET /api/products/search)...');
  try {
    const searchRes = await makeRequest(5000, '/api/products/search?keyword=test', 'GET');
    if (searchRes.statusCode === 200) {
      console.log('   ✅ SUCCESS: Search suggestion returned status 200.');
    } else {
      console.log('   ❌ FAILED:', searchRes.body);
    }
  } catch (err) {
    console.log('   ❌ FAILED with connection error.');
  }

  // 6. Test filters
  console.log('\n📋 7. Testing Product Filtering (GET /api/products/filter)...');
  try {
    const filterRes = await makeRequest(5000, '/api/products/filter?location=New%20Delhi', 'GET');
    if (filterRes.statusCode === 200) {
      console.log('   ✅ SUCCESS: Product filter returned status 200.');
    } else {
      console.log('   ❌ FAILED:', filterRes.body);
    }
  } catch (err) {
    console.log('   ❌ FAILED with connection error.');
  }

  // 7. Get admin dashboard users & analytics (port 5001)
  if (adminToken) {
    console.log('\n📋 8. Fetching Admin Users Log (GET /api/admin/users)...');
    try {
      const usersRes = await makeRequest(5001, '/api/admin/users', 'GET', {
        'Authorization': `Bearer ${adminToken}`
      });
      if (usersRes.statusCode === 200 && Array.isArray(usersRes.body)) {
        console.log(`   ✅ SUCCESS: Admin fetched ${usersRes.body.length} users successfully.`);
      } else {
        console.log('   ❌ FAILED:', usersRes.body);
      }
    } catch (err) {
      console.log('   ❌ FAILED with connection error.');
    }

    console.log('\n📋 9. Fetching Admin Analytics Dashboard (GET /api/admin/analytics)...');
    try {
      const analyticsRes = await makeRequest(5001, '/api/admin/analytics', 'GET', {
        'Authorization': `Bearer ${adminToken}`
      });
      if (analyticsRes.statusCode === 200 && analyticsRes.body.metrics) {
        console.log('   ✅ SUCCESS: Admin fetched analytics metrics successfully:', analyticsRes.body.metrics);
      } else {
        console.log('   ❌ FAILED:', analyticsRes.body);
      }
    } catch (err) {
      console.log('   ❌ FAILED with connection error.');
    }
  } else {
    console.log('\n📋 8-9. Skipping Admin tests since Admin Token was not acquired.');
  }

  console.log('\n🏁 --- ENDPOINT AUDIT COMPLETE --- 🏁');
}

runAllTests();
