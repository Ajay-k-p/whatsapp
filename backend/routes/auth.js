const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Ensure this is imported

const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Private Route
router.get('/me', auth, getMe);

// Add user search route
router.get('/search', auth, async (req, res) => {
  try {
    const { phone } = req.query;
    console.log('Searching for phone:', phone);  // Debug log
    if (!phone) return res.status(400).json({ error: 'Phone query required' });
    const users = await User.find({ phone: new RegExp(phone, 'i') }).select('name phone _id');
    console.log('Found users:', users);  // Debug log
    res.json(users);
  } catch (err) {
    console.error('Search error:', err);  // Debug log
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;