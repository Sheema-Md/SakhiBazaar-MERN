const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  forgotPassword,
  verifyOtp,
  resetPassword,
  googleLogin,
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
  logoutUser,
  deleteUserProfile,
  getSavedAddresses,
  saveAddress,
  deleteSavedAddress,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/logout', logoutUser);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserProfile);

router.get('/preferences', protect, getUserPreferences);
router.put('/preferences', protect, updateUserPreferences);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Admin routes
console.log('DEBUG /users route: protect =', typeof protect, 'admin =', typeof admin, 'getAllUsers =', typeof getAllUsers);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUserByAdmin);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/addresses', protect, getSavedAddresses);
router.post('/addresses', protect, saveAddress);
router.delete('/addresses/:id', protect, deleteSavedAddress);

module.exports = router;
