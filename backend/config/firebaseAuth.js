const https = require('https');
const jwt = require('jsonwebtoken');

// In-memory cache for Google public x509 certificates
let cachedCerts = null;
let certsExpiry = 0;

/**
 * Fetch Google's public x509 certificates for Firebase Auth ID token verification
 */
const getGoogleCertificates = () => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    if (cachedCerts && now < certsExpiry) {
      return resolve(cachedCerts);
    }

    const url = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    https.get(url, (res) => {
      let data = '';

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch Google certificates. Status code: ${res.statusCode}`));
      }

      // Read cache-control max-age header if available
      const cacheControl = res.headers['cache-control'];
      let maxAge = 3600 * 6; // default 6 hours in seconds
      if (cacheControl) {
        const match = cacheControl.match(/max-age=(\d+)/);
        if (match && match[1]) {
          maxAge = parseInt(match[1], 10);
        }
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          cachedCerts = JSON.parse(data);
          certsExpiry = Date.now() + maxAge * 1000;
          resolve(cachedCerts);
        } catch (err) {
          reject(new Error(`Failed to parse Google certificates: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Cryptographically verify a Firebase ID Token using Google's public certificates
 * @param {string} idToken - The Firebase ID token from client
 * @param {string} projectId - The Firebase Project ID
 * @returns {Promise<{ valid: boolean, user?: object, error?: string }>}
 */
const verifyFirebaseIdToken = async (idToken, projectId) => {
  if (!idToken || typeof idToken !== 'string') {
    return { valid: false, error: 'Missing or invalid token format' };
  }

  try {
    // 1. Decode token header to extract the Key ID (kid)
    const decodedHeader = jwt.decode(idToken, { complete: true });
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
      return { valid: false, error: 'Invalid token structure or missing kid header' };
    }

    if (decodedHeader.header.alg !== 'RS256') {
      return { valid: false, error: `Invalid algorithm '${decodedHeader.header.alg}'. Expected RS256.` };
    }

    const { kid } = decodedHeader.header;

    // 2. Retrieve public certificates from Google
    const certs = await getGoogleCertificates();
    const certificate = certs[kid];

    if (!certificate) {
      return { valid: false, error: 'Token key ID (kid) not found in Google public certificates' };
    }

    // 3. Verify RS256 signature, audience, and issuer
    const expectedAudience = projectId;
    const expectedIssuer = `https://securetoken.google.com/${projectId}`;

    const verifiedPayload = jwt.verify(idToken, certificate, {
      algorithms: ['RS256'],
      audience: expectedAudience,
      issuer: expectedIssuer,
    });

    // 4. Validate subject (Firebase user UID) and email
    if (!verifiedPayload.sub || typeof verifiedPayload.sub !== 'string') {
      return { valid: false, error: 'Token has invalid subject (UID)' };
    }

    if (!verifiedPayload.email) {
      return { valid: false, error: 'Token does not contain an email address' };
    }

    // 5. Return sanitized verified user identity
    return {
      valid: true,
      user: {
        uid: verifiedPayload.sub,
        email: verifiedPayload.email,
        name: verifiedPayload.name || verifiedPayload.email.split('@')[0],
        picture: verifiedPayload.picture || '',
        emailVerified: !!verifiedPayload.email_verified,
      }
    };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token has expired' };
    }
    if (err.name === 'JsonWebTokenError') {
      return { valid: false, error: `Token validation failed: ${err.message}` };
    }
    return { valid: false, error: err.message || 'Token verification error' };
  }
};

module.exports = {
  verifyFirebaseIdToken,
  getGoogleCertificates,
};
