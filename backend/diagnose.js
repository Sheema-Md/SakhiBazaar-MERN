const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const routesDir = path.join(__dirname, 'routes');

console.log('=== Backend Diagnostics ===');

// Test Controller Imports
const controllers = [
  'authController',
  'productController',
  'orderController',
  'chatController',
  'wishlistController',
  'notificationController',
  'aiController'
];

controllers.forEach(c => {
  const filePath = path.join(controllersDir, `${c}.js`);
  if (fs.existsSync(filePath)) {
    try {
      const mod = require(filePath);
      console.log(`\nController: ${c}`);
      Object.keys(mod).forEach(key => {
        console.log(`  - ${key}: ${typeof mod[key]}`);
      });
      // check for undefined properties in exports
      for (const key in mod) {
        if (mod[key] === undefined) {
          console.error(`  [ERROR] ${key} is undefined!`);
        }
      }
    } catch (err) {
      console.error(`[ERROR] Failed to require ${c}:`, err.message);
    }
  } else {
    console.log(`Controller file not found: ${c}`);
  }
});

// Test Middleware Imports
try {
  const authMiddleware = require('./middleware/authMiddleware');
  console.log('\nMiddleware: authMiddleware');
  Object.keys(authMiddleware).forEach(key => {
    console.log(`  - ${key}: ${typeof authMiddleware[key]}`);
  });
} catch (err) {
  console.error('[ERROR] Failed to require authMiddleware:', err.message);
}

// Test Route Files Requiring
console.log('\n=== Loading Route Files ===');
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
routeFiles.forEach(f => {
  console.log(`Loading routes/${f}...`);
  try {
    require(path.join(routesDir, f));
    console.log(`  [OK] routes/${f} loaded successfully`);
  } catch (err) {
    console.error(`  [FAIL] routes/${f} failed to load:`, err.stack);
  }
});
