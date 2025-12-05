const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

const sendMessage = async (req, res) => {
  const { content, chatId, messageType, mediaUrl } = req.body;
  const message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
    messageType,
    mediaUrl,
  });
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });
  const fullMessage = await Message.findOne({ _id: message._id })
    .populate('sender', 'name pic email')
    .populate('chat');
  res.json(fullMessage);
};

const getMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name pic email')
    .populate('chat');
  res.json(messages);
};

module.exports = { sendMessage, getMessages };