const express = require('express');
const { createChat, getChats, addToGroup, removeFromGroup, renameGroup } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createChat);
router.get('/', protect, getChats);
router.put('/add', protect, addToGroup);
router.put('/remove', protect, removeFromGroup);
router.put('/rename', protect, renameGroup);

module.exports = router;