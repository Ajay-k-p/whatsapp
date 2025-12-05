const Chat = require('../models/Chat');
const User = require('../models/User');

const createChat = async (req, res) => {
  const { userId, isGroup, participants, chatName } = req.body;
  if (isGroup) {
    const groupChat = await Chat.create({
      chatName,
      isGroupChat: true,
      participants: [...participants, req.user._id],
      groupAdmin: req.user._id,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate('participants', '-password').populate('groupAdmin', '-password');
    res.json(fullGroupChat);
  } else {
    const chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    }).populate('participants', '-password').populate('latestMessage');
    if (chat) return res.json(chat);
    const newChat = await Chat.create({
      chatName: 'sender',
      isGroupChat: false,
      participants: [req.user._id, userId],
    });
    const fullChat = await Chat.findOne({ _id: newChat._id }).populate('participants', '-password');
    res.json(fullChat);
  }
};

const getChats = async (req, res) => {
  const chats = await Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
    .populate('participants', '-password')
    .populate('groupAdmin', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });
  res.json(chats);
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const chat = await Chat.findByIdAndUpdate(chatId, { $push: { participants: userId } }, { new: true }).populate('participants', '-password').populate('groupAdmin', '-password');
  res.json(chat);
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const chat = await Chat.findByIdAndUpdate(chatId, { $pull: { participants: userId } }, { new: true }).populate('participants', '-password').populate('groupAdmin', '-password');
  res.json(chat);
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  const chat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true }).populate('participants', '-password').populate('groupAdmin', '-password');
  res.json(chat);
};

module.exports = { createChat, getChats, addToGroup, removeFromGroup, renameGroup };