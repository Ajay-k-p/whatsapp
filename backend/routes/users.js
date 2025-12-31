const express = require('express');
const { searchUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, searchUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;