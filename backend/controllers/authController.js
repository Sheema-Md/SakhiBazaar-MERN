const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { verifyFirebaseIdToken } = require('../config/firebaseAuth');

// Helper to safely dispatch emails
const sendEmailHelper = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n======================================================`);
      console.log(`[SMTP MOCK EMAIL] Transporter credentials not set in env.`);
      console.log(`Dispatched to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text}`);
      console.log(`======================================================\n`);
      return;
    }

    const info = await transporter.sendMail({
      from: `"Sakhi Bazaar" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('[SMTP LOG] Message sent successfully: %s', info.messageId);
  } catch (err) {
    console.error('[SMTP ERROR] Failed to dispatch email:', err.message);
  }
};


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

    const normalizedRole = role.toString().trim().toLowerCase();
    if (normalizedRole === 'admin') {
      return res.status(400).json({ message: 'Administrator registration is not permitted via this endpoint' });
    }
    if (!['customer', 'seller'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role specified. Allowed roles are: customer, seller' });
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
      status: 'approved',
    });

    if (user) {
      // Dispatch welcome email
      const welcomeHtml = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #f0e6e6; padding: 24px; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #e11d48; margin-top: 0; font-family: 'Outfit', sans-serif;">Welcome to Sakhi Bazaar, ${user.name}!</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Your account has been registered successfully as a <strong>${user.role}</strong>.</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Discover beautiful, hand-crafted products and connect with amazing local creators.</p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center;">This is an automated notification from Sakhi Bazaar.</p>
        </div>
      `;
      sendEmailHelper(
        user.email,
        'Welcome to Sakhi Bazaar!',
        `Welcome to Sakhi Bazaar, ${user.name}! Your account has been registered successfully as a ${user.role}.`,
        welcomeHtml
      );

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
    const identifier = (loginId || email || '').trim();

    // Validate identifier
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email address or username.'
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    // Find account by email OR username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });

    // Account does not exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account was found with this email address or username.'
      });
    }

    // Suspended account
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact Sakhi Bazaar support.'
      });
    }

    // Pending account
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is awaiting approval. Please try again after your account has been approved.'
      });
    }

    // Verify password
    const passwordMatches = await user.matchPassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect Credentials.'
      });
    }

    // Successful login
    return res.json({
      success: true,
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

  } catch (error) {
    console.error('loginUser error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to sign in right now. Please try again later.'
    });
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

const getSavedAddresses = async (req, res) => {
  const user = await User.findById(req.user._id).select('savedAddresses');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.savedAddresses || []);
};

const saveAddress = async (req, res) => {
  const { label, name, address, city, state, zip, country, isDefault } = req.body;
  if (![name, address, city, state, zip].every((value) => String(value || '').trim())) return res.status(400).json({ message: 'Name, address, city, state and PIN code are required' });
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (isDefault || user.savedAddresses.length === 0) user.savedAddresses.forEach((saved) => { saved.isDefault = false; });
  user.savedAddresses.push({ label: String(label || 'Home').trim(), name: name.trim(), address: address.trim(), city: city.trim(), state: state.trim(), zip: zip.trim(), country: String(country || 'India').trim(), isDefault: Boolean(isDefault) || user.savedAddresses.length === 0 });
  await user.save();
  res.status(201).json(user.savedAddresses[user.savedAddresses.length - 1]);
};

const deleteSavedAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const address = user.savedAddresses.id(req.params.id);
  if (!address) return res.status(404).json({ message: 'Saved address not found' });
  address.deleteOne();
  if (user.savedAddresses.length && !user.savedAddresses.some((item) => item.isDefault)) user.savedAddresses[0].isDefault = true;
  await user.save();
  res.json(user.savedAddresses);
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

    // Send email with OTP code
    const otpHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #f0e6e6; padding: 24px; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #e11d48; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">You requested to reset your password. Use the following 6-digit verification code to proceed:</p>
        <div style="background-color: #fcf6f6; border: 1px dashed #f43f5e; padding: 12px; border-radius: 8px; font-size: 24px; font-weight: 800; text-align: center; color: #e11d48; letter-spacing: 4px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="color: #4b5563; font-size: 12px; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 11px; text-align: center;">This is an automated notification from Sakhi Bazaar platform.</p>
      </div>
    `;

    // Always log to console as well for verification ease
    console.log(`\n======================================================`);
    console.log(`[AUTH SERVER OTP LOG] Reset OTP for: ${email}`);
    console.log(`[OTP CODE]: ${otpCode}`);
    console.log(`======================================================\n`);

    await sendEmailHelper(
      user.email,
      'Sakhi Bazaar - Password Reset Code',
      `Your password reset code is ${otpCode}. It expires in 10 minutes.`,
      otpHtml
    );

    res.json({ message: 'OTP sent successfully. Please check your email inbox (or server console logs).' });
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

// @desc    Authenticate/Register user via verified Google/Firebase ID token
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'sakhibazaar-8c24e';
    const verification = await verifyFirebaseIdToken(idToken, projectId);

    if (!verification.valid) {
      return res.status(401).json({ message: `Authentication failed: ${verification.error}` });
    }

    const { email, name, picture } = verification.user;

    if (!email) {
      return res.status(400).json({ message: 'Authentication token does not contain a verified email address' });
    }

    const verifiedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: verifiedEmail });

    if (user) {
      // Check if user account is suspended
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Access denied. Account is suspended.' });
      }

      // Link / populate avatar if not present
      if (!user.avatar && picture) {
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create user if not exists
      // Generate a strong random password that complies with User schema validation constraints
      const randomPassword = 'GoogleAuth_123!_' + Math.random().toString(36).substring(2, 15);

      // Auto-generate username from verified email
      const baseUsername = verifiedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      let generatedUsername = baseUsername;
      let usernameExists = await User.findOne({ username: generatedUsername.toLowerCase() });
      while (usernameExists) {
        generatedUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
        usernameExists = await User.findOne({ username: generatedUsername.toLowerCase() });
      }

      // Strict role sanitization: only allow 'seller' if explicitly requested, otherwise default to 'customer'. Never 'admin'.
      const sanitizedRole = (role && role.toString().trim().toLowerCase() === 'seller') ? 'seller' : 'customer';

      user = await User.create({
        name: name || baseUsername,
        username: generatedUsername.toLowerCase(),
        email: verifiedEmail,
        password: randomPassword,
        role: sanitizedRole,
        avatar: picture || '',
        status: 'approved',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      address: user.address || '',
      avatar: user.avatar || '',
      language: user.language || 'en',
      themePreference: user.themePreference || 'light',
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error during Google Authentication' });
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
  getSavedAddresses,
  saveAddress,
  deleteSavedAddress,
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
