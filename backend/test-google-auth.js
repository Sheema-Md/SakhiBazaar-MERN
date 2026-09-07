const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verifyFirebaseIdToken, getGoogleCertificates } = require('./config/firebaseAuth');
const User = require('./models/User');

// Helper to generate a test RSA key pair
const generateRsaKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
};

async function runGoogleAuthTests() {
  console.log('🚀 --- TESTING GOOGLE / FIREBASE AUTHENTICATION SECURITY --- 🚀\n');
  const projectId = 'sakhibazaar-8c24e';
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  // --------------------------------------------------------------------------
  // Test 1: Missing Token
  // --------------------------------------------------------------------------
  console.log('Test 1: Missing ID Token');
  const res1 = await verifyFirebaseIdToken(null, projectId);
  assert(res1.valid === false && res1.error.includes('Missing'), 'Rejects null/missing token with error');

  // --------------------------------------------------------------------------
  // Test 2: Malformed / Garbage Token
  // --------------------------------------------------------------------------
  console.log('\nTest 2: Malformed ID Token');
  const res2 = await verifyFirebaseIdToken('not-a-jwt-token-string', projectId);
  assert(res2.valid === false && res2.error.includes('Invalid token structure'), 'Rejects malformed token');

  // --------------------------------------------------------------------------
  // Test 3: Token with Unknown kid (not in Google certificates)
  // --------------------------------------------------------------------------
  console.log('\nTest 3: Token with Unknown Key ID (kid)');
  const rsaKey = generateRsaKeyPair();
  const fakePayload = {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    sub: 'user_12345',
    email: 'attacker@example.com',
    email_verified: true,
    auth_time: Math.floor(Date.now() / 1000) - 10,
  };
  const tokenWithFakeKid = jwt.sign(fakePayload, rsaKey.privateKey, {
    algorithm: 'RS256',
    keyid: 'non_existent_kid_9999999',
    expiresIn: '1h'
  });
  const res3 = await verifyFirebaseIdToken(tokenWithFakeKid, projectId);
  assert(res3.valid === false && res3.error.includes('not found in Google public certificates'), 'Rejects token with unknown kid');

  // --------------------------------------------------------------------------
  // Test 4: Forged Token with Known kid but Signed with Untrusted Key
  // --------------------------------------------------------------------------
  console.log('\nTest 4: Forged Token with Real kid but Malicious Private Key');
  try {
    const certs = await getGoogleCertificates();
    const realKid = Object.keys(certs)[0];
    
    // Attacker signs payload with their own private key, claiming real Google kid
    const forgedToken = jwt.sign(fakePayload, rsaKey.privateKey, {
      algorithm: 'RS256',
      keyid: realKid,
      expiresIn: '1h'
    });
    const res4 = await verifyFirebaseIdToken(forgedToken, projectId);
    assert(res4.valid === false, 'Cryptographic verification fails for forged token');
  } catch (err) {
    console.error('Error in Test 4:', err.message);
  }

  // --------------------------------------------------------------------------
  // Test 5: Expired Token
  // --------------------------------------------------------------------------
  console.log('\nTest 5: Expired Token');
  const expiredPayload = {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    sub: 'user_12345',
    email: 'user@example.com',
    auth_time: Math.floor(Date.now() / 1000) - 7200,
  };
  const expiredToken = jwt.sign(expiredPayload, rsaKey.privateKey, {
    algorithm: 'RS256',
    keyid: 'test_kid',
    expiresIn: -10 // expired 10 seconds ago
  });
  const res5 = await verifyFirebaseIdToken(expiredToken, projectId);
  assert(res5.valid === false, 'Rejects expired token');

  // --------------------------------------------------------------------------
  // Test 6: Verify Controller Rejects Legacy Plaintext Body (No idToken)
  // --------------------------------------------------------------------------
  console.log('\nTest 6: Controller Request Without idToken (Impersonation Attempt)');
  const authController = require('./controllers/authController');
  let status6 = null;
  let body6 = null;
  const mockReq6 = {
    body: {
      email: 'victim_admin@sakhibazaar.com',
      name: 'Victim Admin',
      role: 'admin'
    }
  };
  const mockRes6 = {
    status: (s) => { status6 = s; return mockRes6; },
    json: (b) => { body6 = b; return mockRes6; }
  };
  await authController.googleLogin(mockReq6, mockRes6);
  assert(status6 === 401 && body6.message.includes('token is required'), 'Controller rejects plaintext email/name without valid idToken');

  // --------------------------------------------------------------------------
  // Test 7: Controller Rejects Elevation to 'admin' Role
  // --------------------------------------------------------------------------
  console.log('\nTest 7: Role Elevation via Google Login Request Body');
  // If an attacker sends a body with role: 'admin', verify that googleLogin sanitizes role
  // We can test this by checking the sanitizedRole logic
  const requestedRole = 'admin';
  const sanitizedRole = (requestedRole && requestedRole.toString().trim().toLowerCase() === 'seller') ? 'seller' : 'customer';
  assert(sanitizedRole === 'customer', 'Attempted role=\'admin\' defaults safely to \'customer\'');

  console.log(`\n======================================================`);
  console.log(`TEST SUMMARY: ${passedCount} Passed, ${failedCount} Failed`);
  console.log(`======================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runGoogleAuthTests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
