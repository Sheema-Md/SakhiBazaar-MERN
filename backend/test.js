const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware');

console.log('--- DIAGNOSTICS ---');
console.log('authController type:', typeof authController);
console.log('authController keys:', Object.keys(authController));
console.log('getAllUsers type:', typeof authController.getAllUsers);

console.log('authMiddleware type:', typeof authMiddleware);
console.log('authMiddleware keys:', Object.keys(authMiddleware));
console.log('protect type:', typeof authMiddleware.protect);
console.log('admin type:', typeof authMiddleware.admin);
