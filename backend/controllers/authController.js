const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('registerUser req.body:', req.body);
    const { name, username, email, phoneNumber, aadhaarNumber, password, confirmPassword, role } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Phone: exactly 10 digits (validate if provided)
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    // Aadhaar: exactly 12 digits (validate if provided)
    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ message: 'Aadhaar number must be exactly 12 digits' });
    }

    // Strong password check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. @$!%*?&#).' });
    }

    // Check unique constraints
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Auto-generate username from email
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    let generatedUsername = baseUsername;
    let usernameExists = await User.findOne({ username: generatedUsername.toLowerCase() });
    while (usernameExists) {
      generatedUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      usernameExists = await User.findOne({ username: generatedUsername.toLowerCase() });
    }

    if (phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number is already registered' });
      }
    }

    if (aadhaarNumber) {
      const aadhaarExists = await User.findOne({ aadhaarNumber });
      if (aadhaarExists) {
        return res.status(400).json({ message: 'Aadhaar number is already registered' });
      }
    }

    // Create user (sellers are pending vetting, customers are approved automatically)
    const user = await User.create({
      name,
      username: generatedUsername.toLowerCase(),
      email: email.toLowerCase(),
      phoneNumber: phoneNumber || undefined,
      aadhaarNumber: aadhaarNumber || undefined,
      password,
      role: role || 'customer',
      status: role === 'seller' ? 'pending' : 'approved',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        aadhaarNumber: user.aadhaarNumber,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (supports Email or Username login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, loginId, password } = req.body;
    const identifier = loginId || email;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email or username, and password' });
    }

    const trimmedIdentifier = identifier.trim();
    console.log('Login attempt identifier:', trimmedIdentifier);

    // Check for user
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier.toLowerCase() },
        { username: trimmedIdentifier.toLowerCase() }
      ]
    });

    if (!user) {
      console.log(`Login failed: User not found for identifier "${trimmedIdentifier}"`);
    } else {
      const match = await user.matchPassword(password);
      console.log(`Login user found: "${user.email}". Password match:`, match);
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        aadhaarNumber: user.aadhaarNumber,
        status: user.status,
        address: user.address,
        avatar: user.avatar,
        language: user.language || 'en',
        themePreference: user.themePreference || 'light',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.username = req.body.username || user.username;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.phoneNumber = req.body.phoneNumber || req.body.phone || user.phoneNumber;
      user.aadhaarNumber = req.body.aadhaarNumber || req.body.aadhaar || user.aadhaarNumber;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      user.language = req.body.language || user.language;
      user.themePreference = req.body.themePreference || req.body.theme || user.themePreference;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
        aadhaarNumber: updatedUser.aadhaarNumber,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        language: updatedUser.language,
        themePreference: updatedUser.themePreference,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user preferences
// @route   GET /api/auth/preferences
// @access  Private
const getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        theme: user.themePreference || user.preferences?.theme || 'light',
        language: user.language || user.preferences?.language || 'en'
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.theme) {
        user.themePreference = req.body.theme;
        if (!user.preferences) user.preferences = {};
        user.preferences.theme = req.body.theme;
      }
      if (req.body.language) {
        user.language = req.body.language;
        if (!user.preferences) user.preferences = {};
        user.preferences.language = req.body.language;
      }

      await user.save();
      res.json({
        theme: user.themePreference,
        language: user.language
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - request OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email' });
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiration

    user.otp = { code: otpCode, expiresAt };
    await user.save();

    // Log to console for dev workflow verification
    console.log(`\n======================================================`);
    console.log(`[AUTH SERVER OTP LOG] Reset OTP for: ${email}`);
    console.log(`[OTP CODE]: ${otpCode}`);
    console.log(`======================================================\n`);

    res.json({ message: 'OTP sent successfully. Please check server console logs.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'Invalid request or OTP expired' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password with verified OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otp.code || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid request or invalid OTP' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Set new password
    user.password = password;
    // Clear OTP fields
    user.otp = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate/Register user via Google
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Missing Google user information' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      // Generate a strong random password that complies with User schema validation constraints
      const randomPassword = 'GoogleAuth_123!_' + Math.random().toString(36).substring(2, 15);
      
      // Auto-generate username from email
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      let generatedUsername = baseUsername;
      let usernameExists = await User.findOne({ username: generatedUsername.toLowerCase() });
      while (usernameExists) {
        generatedUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
        usernameExists = await User.findOne({ username: generatedUsername.toLowerCase() });
      }

      user = await User.create({
        name,
        username: generatedUsername.toLowerCase(),
        email,
        password: randomPassword,
        role: role || 'customer',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status / details (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.role = req.body.role || user.role;
      user.status = req.body.status || user.status;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.address = req.body.address !== undefined ? req.body.address : user.address;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Delete logged in user profile
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'Profile deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
