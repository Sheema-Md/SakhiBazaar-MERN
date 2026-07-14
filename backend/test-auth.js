const http = require('http');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
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

async function runTests() {
  const email = `test_seller_${Date.now()}@example.com`;
  const password = 'password123';
  console.log('--- STARTING AUTH ENDPOINT TESTS ---');
  console.log(`Using email: ${email}\n`);

  // 1. TEST REGISTRATION
  console.log('1. Testing Registration (POST /api/auth/register)...');
  try {
    const regRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Sakhi Seller',
      email,
      password,
      role: 'seller'
    });

    if (regRes.statusCode === 201 && regRes.body.token) {
      console.log('✅ Registration SUCCESSFUL!');
      console.log('Response body:', JSON.stringify(regRes.body, null, 2));
    } else {
      console.log(`❌ Registration FAILED (Status: ${regRes.statusCode})`);
      console.log('Error:', regRes.body);
      return;
    }

    const token = regRes.body.token;

    // 2. TEST LOGIN
    console.log('\n2. Testing Login (POST /api/auth/login)...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email,
      password
    });

    if (loginRes.statusCode === 200 && loginRes.body.token) {
      console.log('✅ Login SUCCESSFUL!');
      console.log('Response body:', JSON.stringify(loginRes.body, null, 2));
    } else {
      console.log(`❌ Login FAILED (Status: ${loginRes.statusCode})`);
      console.log('Error:', loginRes.body);
      return;
    }

    // 3. TEST GET PROFILE
    console.log('\n3. Testing Get Profile (GET /api/auth/profile)...');
    const profileRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileRes.statusCode === 200 && profileRes.body._id) {
      console.log('✅ Profile Fetch SUCCESSFUL!');
      console.log('Response body:', JSON.stringify(profileRes.body, null, 2));
    } else {
      console.log(`❌ Profile Fetch FAILED (Status: ${profileRes.statusCode})`);
      console.log('Error:', profileRes.body);
    }

  } catch (error) {
    console.error('❌ Request error:', error.message);
    console.log('\nIs the server running on port 5000? Is MongoDB running and connected?');
  }
}

runTests();
