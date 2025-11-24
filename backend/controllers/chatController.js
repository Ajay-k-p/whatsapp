const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
  try {
    const { participants } = req.body;
    const chat = new Chat({ participants });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id }).populate('participants lastMessage');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};