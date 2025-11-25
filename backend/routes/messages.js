// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getIo } = require('../utils/socket');


// -----------------------------------------
// SEND MESSAGE (Persist + Socket Emit)
// -----------------------------------------
router.post('/send', async (req, res) => {
  try {
    const { chatId, sender, content, media } = req.body;

    if (!chatId || !sender) {
      return res.status(400).json({ message: 'chatId and sender required' });
    }

    const msg = await Message.create({
      chat: chatId,
      sender,
      content: content || '',
      media: media || null,
      createdAt: new Date(),
    });

    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: msg._id },
      lastMessage: msg._id,
    });

    const io = getIo();
    if (io) io.to(`chat_${chatId}`).emit('messageReceived', msg);

    return res.status(201).json(msg);
  } catch (err) {
    console.error('send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// -----------------------------------------
// GET ALL MESSAGES FOR A CHAT
// -----------------------------------------
router.get('/chat/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .exec();

    return res.json(messages);
  } catch (err) {
    console.error("get messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// -----------------------------------------
// REACT TO A MESSAGE
// -----------------------------------------
router.post('/react', async (req, res) => {
  try {
    const { messageId, userId, reaction } = req.body;

    if (!messageId || !userId || !reaction) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { $push: { reactions: { user: userId, reaction } } },
      { new: true }
    );

    const io = getIo();
    if (io && updated) {
      io.to(`chat_${updated.chat}`).emit('reactionUpdated', updated);
    }

    res.json(updated);

  } catch (err) {
    console.error('react error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// -----------------------------------------
// DELETE MESSAGE FOR EVERYONE
// -----------------------------------------
router.post('/deleteForAll', async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: 'messageId required' });
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { deletedForAll: true, deletedAt: new Date() },
      { new: true }
    );

    const io = getIo();
    if (io && updated) {
      io.to(`chat_${updated.chat}`).emit('messageDeletedForAll', { messageId });
    }

    res.json({ success: true });

  } catch (err) {
    console.error('deleteForAll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// -----------------------------------------
// DELETE MESSAGE FOR ME (Local Delete)
// -----------------------------------------
router.post('/deleteForMe', async (req, res) => {
  try {
    const { messageId, userId } = req.body;

    if (!messageId || !userId) {
      return res.status(400).json({ message: 'messageId and userId required' });
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deletedFor: userId } },
      { new: true }
    );

    res.json({ success: true, message: updated });

  } catch (err) {
    console.error('deleteForMe error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
