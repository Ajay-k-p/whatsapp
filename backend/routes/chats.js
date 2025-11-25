// backend/routes/chats.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');


// ----------------------------------------------------------
// CREATE 1:1 OR GROUP CHAT (Duplicate-proof)
// ----------------------------------------------------------
router.post('/create', async (req, res) => {
  try {
    const { participants, name, isGroup } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'participants required' });
    }

    // ✔ Prevent duplicate 1-to-1 chat
    if (!isGroup && participants.length === 2) {
      const existing = await Chat.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      })
        .populate('participants', '-password')
        .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name _id' } });

      if (existing) {
        return res.status(200).json(existing);
      }
    }

    // Create new chat
    const chat = await Chat.create({
      participants,
      name: name || null,
      isGroup: !!isGroup,
    });

    const populated = await Chat.findById(chat._id)
      .populate('participants', '-password');

    return res.status(201).json(populated);

  } catch (err) {
    console.error('create chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ----------------------------------------------------------
// GET ALL CHATS FOR A USER (Complete chat list)
// ----------------------------------------------------------
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name _id profilePic' }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);

  } catch (err) {
    console.error('get chats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ----------------------------------------------------------
// OPTIONAL: Get single chat by ID
// ----------------------------------------------------------
router.get('/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name _id profilePic' }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);

  } catch (err) {
    console.error('get single chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
