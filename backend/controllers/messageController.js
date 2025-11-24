const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { getIo } = require("../utils/socket");

exports.sendMessage = async (req, res) => {
  try {
    const { chat, content, media, type } = req.body;
    const sender = req.user.id;

    const msg = new Message({
      chat,
      sender,
      content: content || null,
      media: media || null,
      type: type || "text",
    });

    const saved = await msg.save();
    const populated = await saved.populate("sender");

    const io = getIo();

    // Broadcast the message
    io.to(chat).emit("receiveMessage", {
      ...populated.toObject(),
      senderId: sender,
    });

    // Find participants
    const chatDoc = await Chat.findById(chat).populate("participants");

    chatDoc.participants.forEach((user) => {
      if (String(user._id) !== String(sender)) {
        io.to(String(sender)).emit("messageDelivered", {
          messageId: saved._id,
          chatId: chat,
          deliveredTo: String(user._id),
        });
      }
    });

    res.json(populated);
  } catch (err) {
    console.error("sendMessage error", err);
    res.status(500).json({ error: "Message send failed" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await Message.find({ chat: chatId }).populate("sender");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch messages" });
  }
};
